import { CARDS } from "./cards.js?v=20260922-3";
import {
  areTeamNamesValid,
  formatSignedScore,
  makeId,
  normalizeTeamName,
  scoreRound,
  shuffle,
  takeNextUnseenCard
} from "./game-core.js";

const STORAGE_KEY = "dont-say-it:v2";
const TEAM_LIMIT = 8;
const DEFAULT_TEAMS = [
  { id: "team-sun", name: "Team Sun", score: 0 },
  { id: "team-sky", name: "Team Sky", score: 0 }
];

const elements = {
  addTeamButton: document.querySelector("#addTeamButton"),
  activeTeamName: document.querySelector("#activeTeamName"),
  cardWord: document.querySelector("#cardWord"),
  closeRulesButton: document.querySelector("#closeRulesButton"),
  closeSummaryButton: document.querySelector("#closeSummaryButton"),
  correctButton: document.querySelector("#correctButton"),
  dialogAddTeam: document.querySelector("#dialogAddTeam"),
  durationChoices: document.querySelector("#durationChoices"),
  forbiddenWords: document.querySelector("#forbiddenWords"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  nextTeamButton: document.querySelector("#nextTeamButton"),
  newGameButton: document.querySelector("#newGameButton"),
  resetDialog: document.querySelector("#resetDialog"),
  resetGameButton: document.querySelector("#resetGameButton"),
  cancelResetButton: document.querySelector("#cancelResetButton"),
  keepGameButton: document.querySelector("#keepGameButton"),
  rulesButton: document.querySelector("#rulesButton"),
  rulesDialog: document.querySelector("#rulesDialog"),
  rulesPlayButton: document.querySelector("#rulesPlayButton"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsDialog: document.querySelector("#settingsDialog"),
  settingsForm: document.querySelector("#settingsForm"),
  skipButton: document.querySelector("#skipButton"),
  skipPenaltyInput: document.querySelector("#skipPenaltyInput"),
  startPanel: document.querySelector("#startPanel"),
  startRoundButton: document.querySelector("#startRoundButton"),
  summaryCorrect: document.querySelector("#summaryCorrect"),
  summaryDialog: document.querySelector("#summaryDialog"),
  summaryScore: document.querySelector("#summaryScore"),
  summarySkipped: document.querySelector("#summarySkipped"),
  summaryTaboo: document.querySelector("#summaryTaboo"),
  summaryTeam: document.querySelector("#summaryTeam"),
  tabooButton: document.querySelector("#tabooButton"),
  teamEditor: document.querySelector("#teamEditor"),
  teamHelp: document.querySelector("#teamHelp"),
  teamList: document.querySelector("#teamList"),
  timerButton: document.querySelector("#timerButton"),
  timerFill: document.querySelector("#timerFill"),
  timerText: document.querySelector("#timerText"),
  toastRegion: document.querySelector("#toastRegion"),
  wordCard: document.querySelector("#wordCard")
};

const stored = loadStoredState();
const state = {
  teams: stored.teams,
  activeTeamIndex: Math.min(stored.activeTeamIndex, stored.teams.length - 1),
  duration: stored.duration,
  skipPenalty: stored.skipPenalty,
  roundNumber: stored.roundNumber,
  running: false,
  paused: false,
  endAt: 0,
  remainingMs: stored.duration * 1000,
  currentCard: null,
  lastTarget: "",
  cardsSeen: stored.usedCardIds.length,
  roundStats: freshRoundStats()
};

let usedCardIds = new Set(stored.usedCardIds);
let deck = shuffle(CARDS.filter((card) => !usedCardIds.has(card.id)));
let deckIndex = 0;
let timerFrame = 0;
let draftTeams = [];
let settingsHadError = false;

function freshRoundStats() {
  return { correct: 0, skipped: 0, taboo: 0 };
}

function loadStoredState() {
  const fallback = {
    teams: DEFAULT_TEAMS.map((team) => ({ ...team })),
    activeTeamIndex: 0,
    duration: 60,
    skipPenalty: false,
    roundNumber: 0,
    usedCardIds: []
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const teams = Array.isArray(parsed.teams)
      ? parsed.teams
          .slice(0, TEAM_LIMIT)
          .map((team, index) => ({
            id: typeof team.id === "string" ? team.id : makeId(`team-${index + 1}`),
            name: normalizeTeamName(String(team.name ?? "")),
            score: Number.isFinite(team.score) ? Math.trunc(team.score) : 0
          }))
          .filter((team) => team.name)
      : [];

    if (teams.length < 2 || !areTeamNamesValid(teams.map((team) => team.name))) return fallback;
    const durationOptions = [30, 45, 60, 90, 120];
    const playableCardIds = new Set(CARDS.map((card) => card.id));
    const usedCardIds = Array.isArray(parsed.usedCardIds)
      ? [...new Set(parsed.usedCardIds.filter((id) => typeof id === "string" && playableCardIds.has(id)))]
      : [];

    return {
      teams,
      activeTeamIndex: Number.isInteger(parsed.activeTeamIndex) ? Math.max(0, parsed.activeTeamIndex) : 0,
      duration: durationOptions.includes(parsed.duration) ? parsed.duration : 60,
      skipPenalty: Boolean(parsed.skipPenalty),
      roundNumber: Number.isInteger(parsed.roundNumber) ? Math.max(0, parsed.roundNumber) : 0,
      usedCardIds
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams: state.teams,
        activeTeamIndex: state.activeTeamIndex,
        duration: state.duration,
        skipPenalty: state.skipPenalty,
        roundNumber: state.roundNumber,
        usedCardIds: [...usedCardIds]
      })
    );
  } catch {
    showError("Scores won’t persist.");
  }
}

function renderApp() {
  elements.activeTeamName.textContent = state.teams[state.activeTeamIndex].name;
  elements.timerText.textContent = String(Math.ceil(state.remainingMs / 1000));
  renderTeams();
  setActionState(state.running && !state.paused);
  updateTimerVisual();
}

function renderTeams() {
  elements.teamList.replaceChildren();
  state.teams.forEach((team, index) => {
    const row = document.createElement("div");
    row.className = "team-row";
    row.dataset.accent = String(index % 5);
    row.setAttribute("aria-current", String(index === state.activeTeamIndex));

    const copy = document.createElement("div");
    copy.className = "team-row__name";
    const name = document.createElement("strong");
    name.textContent = team.name;
    copy.append(name);

    const stepper = document.createElement("div");
    stepper.className = "score-stepper";
    const minus = scoreButton("−", `Subtract one point from ${team.name}`, team.id, -1);
    const score = document.createElement("strong");
    score.textContent = String(team.score);
    score.setAttribute("aria-label", `${team.name} score: ${team.score}`);
    const plus = scoreButton("+", `Add one point to ${team.name}`, team.id, 1);
    stepper.append(minus, score, plus);
    row.append(copy, stepper);
    elements.teamList.append(row);
  });
}

function scoreButton(label, ariaLabel, teamId, delta) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-label", ariaLabel);
  button.dataset.teamId = teamId;
  button.dataset.delta = String(delta);
  return button;
}

function setActionState(enabled) {
  [elements.correctButton, elements.skipButton, elements.tabooButton].forEach((button) => {
    button.disabled = !enabled;
  });
}

function getNextCard() {
  const next = takeNextUnseenCard(deck, deckIndex, usedCardIds);
  deckIndex = next.nextIndex;
  if (!next.card) return null;
  state.lastTarget = next.card.target;
  state.cardsSeen = usedCardIds.size;
  return next.card;
}

function showCard(card, animate = true) {
  state.currentCard = card;
  if (animate) {
    elements.wordCard.classList.add("is-swapping");
  }

  const update = () => {
    elements.cardWord.textContent = card.target;
    elements.forbiddenWords.replaceChildren(
      ...card.forbidden.map((word) => {
        const item = document.createElement("li");
        item.textContent = word;
        return item;
      })
    );
    requestAnimationFrame(() => elements.wordCard.classList.remove("is-swapping"));
  };

  if (animate) window.setTimeout(update, 90);
  else update();
}

function startRound() {
  if (state.running) return;
  const nextCard = getNextCard();
  if (!nextCard) {
    showError("Every card in this game has been used. Start a new game for a fresh deck.");
    return;
  }
  state.running = true;
  state.paused = false;
  state.roundNumber += 1;
  state.roundStats = freshRoundStats();
  state.remainingMs = state.duration * 1000;
  state.endAt = Date.now() + state.remainingMs;
  elements.wordCard.dataset.state = "playing";
  elements.startPanel.inert = true;
  elements.timerButton.disabled = false;
  elements.timerButton.setAttribute("aria-label", "Pause timer");
  showCard(nextCard, false);
  setActionState(true);
  saveState();
  tickTimer();
}

function tickTimer() {
  window.cancelAnimationFrame(timerFrame);
  if (!state.running || state.paused) return;
  state.remainingMs = Math.max(0, state.endAt - Date.now());
  updateTimerVisual();
  if (state.remainingMs <= 0) {
    endRound();
    return;
  }
  timerFrame = window.requestAnimationFrame(tickTimer);
}

function updateTimerVisual() {
  const total = state.duration * 1000;
  const progress = total > 0 ? Math.max(0, Math.min(1, state.remainingMs / total)) : 0;
  elements.timerFill.style.setProperty("--timer-progress", String(progress));
  elements.timerText.textContent = String(Math.ceil(state.remainingMs / 1000));
  elements.timerButton.classList.toggle("is-low", state.running && state.remainingMs <= 10_000);
  elements.timerButton.classList.toggle("is-paused", state.paused);
}

function togglePause() {
  if (!state.running) return;
  if (state.paused) resumeTimer();
  else pauseTimer();
}

function pauseTimer() {
  if (!state.running || state.paused) return;
  state.remainingMs = Math.max(0, state.endAt - Date.now());
  state.paused = true;
  window.cancelAnimationFrame(timerFrame);
  elements.timerButton.setAttribute("aria-label", "Resume timer");
  setActionState(false);
  updateTimerVisual();
}

function resumeTimer() {
  if (!state.running || !state.paused) return;
  state.paused = false;
  state.endAt = Date.now() + state.remainingMs;
  elements.timerButton.setAttribute("aria-label", "Pause timer");
  setActionState(true);
  tickTimer();
}

function recordCard(result) {
  if (!state.running || state.paused) return;
  const team = state.teams[state.activeTeamIndex];
  if (result === "correct") {
    state.roundStats.correct += 1;
    team.score += 1;
  } else if (result === "skipped") {
    state.roundStats.skipped += 1;
    if (state.skipPenalty) team.score -= 1;
  } else {
    state.roundStats.taboo += 1;
    team.score -= 1;
  }
  renderTeams();
  const nextCard = getNextCard();
  if (nextCard) showCard(nextCard);
  else {
    endRound();
    showError("That was the final card. Start a new game to reshuffle the full deck.");
  }
  saveState();
}

function endRound() {
  if (!state.running) return;
  state.running = false;
  state.paused = false;
  state.remainingMs = 0;
  window.cancelAnimationFrame(timerFrame);
  elements.timerButton.disabled = true;
  elements.timerButton.setAttribute("aria-label", "Round timer ended");
  setActionState(false);
  updateTimerVisual();
  showSummary();
}

function showSummary() {
  const team = state.teams[state.activeTeamIndex];
  const delta = scoreRound(state.roundStats, state.skipPenalty);
  elements.summaryTeam.textContent = team.name;
  elements.summaryScore.textContent = formatSignedScore(delta);
  elements.summaryCorrect.textContent = String(state.roundStats.correct);
  elements.summarySkipped.textContent = String(state.roundStats.skipped);
  elements.summaryTaboo.textContent = String(state.roundStats.taboo);
  elements.summaryDialog.showModal();
}

function advanceTeam() {
  state.activeTeamIndex = (state.activeTeamIndex + 1) % state.teams.length;
  state.roundStats = freshRoundStats();
  state.remainingMs = state.duration * 1000;
  elements.wordCard.dataset.state = "idle";
  elements.startPanel.inert = false;
  elements.activeTeamName.textContent = state.teams[state.activeTeamIndex].name;
  renderApp();
  saveState();
}

function resetGame() {
  window.cancelAnimationFrame(timerFrame);
  state.teams = state.teams.map((team) => ({ ...team, score: 0 }));
  state.activeTeamIndex = 0;
  state.roundNumber = 0;
  state.running = false;
  state.paused = false;
  state.endAt = 0;
  state.remainingMs = state.duration * 1000;
  state.currentCard = null;
  state.lastTarget = "";
  state.roundStats = freshRoundStats();
  usedCardIds = new Set();
  deck = shuffle(CARDS);
  deckIndex = 0;
  state.cardsSeen = 0;
  elements.wordCard.dataset.state = "idle";
  elements.startPanel.inert = false;
  elements.timerButton.disabled = true;
  elements.timerButton.setAttribute("aria-label", "Round timer is ready");
  elements.cardWord.textContent = "Ready?";
  elements.forbiddenWords.replaceChildren();
  renderApp();
  saveState();
  showError("New game ready. Scores and the card history were reset.");
}

function adjustTeamScore(teamId, delta) {
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!team) return;
  team.score += delta;
  renderTeams();
  saveState();
}

function openDialog(dialog) {
  const resumeAfterClose = state.running && !state.paused;
  if (resumeAfterClose) pauseTimer();
  dialog.dataset.resumeTimer = String(resumeAfterClose);
  dialog.showModal();
}

function handleDialogClose(event) {
  const dialog = event.currentTarget;
  if (dialog.dataset.resumeTimer === "true" && state.running && state.paused) resumeTimer();
  delete dialog.dataset.resumeTimer;
}

function openSettings(addBlankTeam = false) {
  draftTeams = state.teams.map((team) => ({ ...team }));
  if (addBlankTeam && draftTeams.length < TEAM_LIMIT) {
    draftTeams.push({ id: makeId(), name: `Team ${draftTeams.length + 1}`, score: 0 });
  }
  elements.skipPenaltyInput.checked = state.skipPenalty;
  const durationInput = elements.durationChoices.querySelector(`input[value="${state.duration}"]`);
  if (durationInput) durationInput.checked = true;
  clearTeamError();
  renderTeamEditor();
  openDialog(elements.settingsDialog);
  if (addBlankTeam) {
    const lastInput = elements.teamEditor.querySelector(".team-editor__row:last-child input");
    lastInput?.focus();
    lastInput?.select();
  }
}

function renderTeamEditor() {
  elements.teamEditor.replaceChildren();
  draftTeams.forEach((team, index) => {
    const row = document.createElement("div");
    row.className = "team-editor__row";

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 24;
    input.value = team.name;
    input.dataset.teamId = team.id;
    input.setAttribute("aria-label", `Team ${index + 1} name`);
    input.setAttribute("aria-describedby", "teamHelp");

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-button";
    remove.textContent = "×";
    remove.disabled = draftTeams.length <= 2;
    remove.dataset.removeTeam = team.id;
    remove.setAttribute("aria-label", `Remove ${team.name}`);
    row.append(input, remove);
    elements.teamEditor.append(row);
  });
  elements.dialogAddTeam.disabled = draftTeams.length >= TEAM_LIMIT;
}

function addDraftTeam() {
  if (draftTeams.length >= TEAM_LIMIT) return;
  draftTeams.push({ id: makeId(), name: `Team ${draftTeams.length + 1}`, score: 0 });
  renderTeamEditor();
  const input = elements.teamEditor.querySelector(".team-editor__row:last-child input");
  input?.focus();
  input?.select();
}

function removeDraftTeam(teamId) {
  if (draftTeams.length <= 2) return;
  draftTeams = draftTeams.filter((team) => team.id !== teamId);
  renderTeamEditor();
}

function readDraftTeamNames() {
  return [...elements.teamEditor.querySelectorAll("input")].map((input) => normalizeTeamName(input.value));
}

function validateSettings() {
  const names = readDraftTeamNames();
  const valid = areTeamNamesValid(names);
  settingsHadError = !valid;
  elements.teamEditor.querySelectorAll("input").forEach((input) => {
    input.setAttribute("aria-invalid", String(!valid));
  });
  elements.teamHelp.classList.toggle("is-error", !valid);
  elements.teamHelp.textContent = valid
    ? "2–8 unique names."
    : "Use unique team names.";
  return valid;
}

function clearTeamError() {
  settingsHadError = false;
  elements.teamHelp.classList.remove("is-error");
  elements.teamHelp.textContent = "2–8 unique names.";
}

function saveSettings() {
  if (!validateSettings()) return false;
  const names = readDraftTeamNames();
  draftTeams.forEach((team, index) => {
    team.name = names[index];
  });
  state.teams = draftTeams.map((team) => ({ ...team }));
  state.activeTeamIndex = Math.min(state.activeTeamIndex, state.teams.length - 1);
  const selectedDuration = Number(new FormData(elements.settingsForm).get("duration"));
  state.duration = [30, 45, 60, 90, 120].includes(selectedDuration) ? selectedDuration : 60;
  state.skipPenalty = elements.skipPenaltyInput.checked;
  if (!state.running) state.remainingMs = state.duration * 1000;
  renderApp();
  saveState();
  return true;
}

function showError(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  elements.toastRegion.replaceChildren(toast);
  window.setTimeout(() => toast.remove(), 6000);
}

function syncFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement);
  elements.fullscreenButton.setAttribute("aria-label", isFullscreen ? "Exit full screen" : "Enter full screen");
  elements.fullscreenButton.setAttribute("aria-pressed", String(isFullscreen));
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    showError("Full screen unavailable.");
  }
}

function isEditableTarget(target) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

elements.startRoundButton.addEventListener("click", startRound);
elements.correctButton.addEventListener("click", () => recordCard("correct"));
elements.skipButton.addEventListener("click", () => recordCard("skipped"));
elements.tabooButton.addEventListener("click", () => recordCard("taboo"));
elements.timerButton.addEventListener("click", togglePause);
elements.settingsButton.addEventListener("click", () => openSettings(false));
elements.addTeamButton.addEventListener("click", () => openSettings(true));
elements.rulesButton.addEventListener("click", () => openDialog(elements.rulesDialog));
elements.newGameButton.addEventListener("click", () => openDialog(elements.resetDialog));
elements.fullscreenButton.addEventListener("click", toggleFullscreen);
elements.closeRulesButton.addEventListener("click", () => elements.rulesDialog.close());
elements.rulesPlayButton.addEventListener("click", () => {
  elements.rulesDialog.dataset.resumeTimer = "false";
  elements.rulesDialog.close();
  if (!state.running) startRound();
});
elements.cancelResetButton.addEventListener("click", () => elements.resetDialog.close("cancel"));
elements.keepGameButton.addEventListener("click", () => elements.resetDialog.close("cancel"));
elements.resetGameButton.addEventListener("click", () => {
  elements.resetDialog.dataset.resumeTimer = "false";
  elements.resetDialog.close("reset");
  resetGame();
});

elements.teamList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-team-id]");
  if (!button) return;
  adjustTeamScore(button.dataset.teamId, Number(button.dataset.delta));
});

elements.dialogAddTeam.addEventListener("click", addDraftTeam);
elements.teamEditor.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove-team]");
  if (button) removeDraftTeam(button.dataset.removeTeam);
});
elements.teamEditor.addEventListener("input", () => {
  if (settingsHadError) validateSettings();
});

elements.settingsForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  if (saveSettings()) elements.settingsDialog.close("saved");
});

elements.closeSummaryButton.addEventListener("click", () => {
  elements.summaryDialog.close();
  advanceTeam();
});

elements.nextTeamButton.addEventListener("click", () => {
  elements.summaryDialog.close();
  advanceTeam();
  startRound();
});

[elements.settingsDialog, elements.rulesDialog, elements.resetDialog].forEach((dialog) => {
  dialog.addEventListener("close", handleDialogClose);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.addEventListener("keydown", (event) => {
  if (isEditableTarget(event.target) || document.querySelector("dialog[open]")) return;
  const key = event.key.toLocaleLowerCase();
  if (event.code === "Space") {
    event.preventDefault();
    if (state.running) togglePause();
    else startRound();
  } else if (state.running && !state.paused && (key === "g" || event.key === "ArrowRight")) {
    event.preventDefault();
    recordCard("correct");
  } else if (state.running && !state.paused && (key === "s" || event.key === "ArrowDown")) {
    event.preventDefault();
    recordCard("skipped");
  } else if (state.running && !state.paused && (key === "t" || event.key === "ArrowLeft")) {
    event.preventDefault();
    recordCard("taboo");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.running && !state.paused) pauseTimer();
});

document.addEventListener("fullscreenchange", syncFullscreenButton);

renderApp();
syncFullscreenButton();
