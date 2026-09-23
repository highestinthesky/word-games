import { CLASSROOM_SAFE_PACK, getCategoryById, shuffleCategories } from "./categories.js";
import {
  LETTERS,
  continueExpiredTurn,
  createGame,
  eliminateActivePlayer,
  getActivePlayer,
  markLetter,
  pauseTurn,
  resumeTurn,
  revivePlayer,
  startOvertime,
  startRound,
  tickTimer
} from "./game-core.js";

const STORAGE_KEY = "word-games:category-sprint:v1";
const DEFAULT_NAMES = ["Player 1", "Player 2", "Player 3"];
const app = document.querySelector("#app");
const liveRegion = document.querySelector("#live-region");
const setupDialog = document.querySelector("#setup-dialog");
const resetDialog = document.querySelector("#reset-dialog");
const rulesDialog = document.querySelector("#rules-dialog");
const keysDialog = document.querySelector("#keys-dialog");
const timeoutDialog = document.querySelector("#timeout-dialog");

let state = loadState();
let toast = "";
let timerId = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

function freshGame(names = DEFAULT_NAMES, settings = {}) {
  return {
    ...createGame({
      names,
      winningScore: settings.winningScore ?? 3,
      timerSeconds: settings.timerSeconds ?? 10
    }),
    drawBag: [],
    lastCategoryId: null
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.players?.length >= 2 && saved.settings?.timerSeconds && saved.settings?.winningScore) {
      // Older saved rounds stopped between turns. Resume them with the new flow.
      if (saved.round?.status === "ready") saved.round.status = "running";
      return { ...saved, drawBag: saved.drawBag ?? [], lastCategoryId: saved.lastCategoryId ?? null };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return freshGame();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function announce(message) {
  if (!message) return;
  liveRegion.textContent = "";
  requestAnimationFrame(() => { liveRegion.textContent = message; });
}

function tell(message) {
  toast = message;
  announce(message);
  window.clearTimeout(tell.timeout);
  tell.timeout = window.setTimeout(() => { toast = ""; render(); }, 4500);
}

function nextCategory() {
  let bag = Array.isArray(state.drawBag) ? state.drawBag.filter((id) => getCategoryById(id)) : [];
  if (!bag.length) {
    bag = shuffleCategories(CLASSROOM_SAFE_PACK.categories).map((category) => category.id);
    if (bag[0] === state.lastCategoryId && bag.length > 1) [bag[0], bag[1]] = [bag[1], bag[0]];
  }
  const id = bag.shift();
  state = { ...state, drawBag: bag, lastCategoryId: id };
  return getCategoryById(id);
}

function drawRound(overtime = false) {
  const category = nextCategory();
  state = overtime ? startOvertime(state, category) : startRound(state, category);
  announce(category.prompt);
  commit();
}

function commit() {
  saveState();
  syncTimer();
  render();
  syncTimeoutDialog();
}

function syncTimeoutDialog() {
  if (state.round?.status === "expired") {
    timeoutDialog.querySelector(".timeout-player").textContent = getActivePlayer(state).name;
    if (!timeoutDialog.open) timeoutDialog.showModal();
  } else if (timeoutDialog.open) {
    timeoutDialog.close();
  }
}

function syncTimer() {
  window.clearInterval(timerId);
  timerId = null;
  if (state.round?.status !== "running") return;
  timerId = window.setInterval(() => {
    state = tickTimer(state);
    if (state.round.status === "expired") announce(getActivePlayer(state).name + " timed out.");
    commit();
  }, 1000);
}

function scoreBoard() {
  return `
    <section class="scoreboard" aria-label="Scores">
      <div class="scoreboard__title"><span class="mono-label">First to ${state.settings.winningScore}</span></div>
      <div class="scoreboard__players">
        ${state.players.map((player, index) => {
          const active = state.round?.activePlayerId === player.id;
          const out = state.round && !state.round.activeIds.includes(player.id);
          return `
            <article class="score-card" data-accent="${index % 4}" data-active="${active && !out}" data-out="${out}" aria-label="${escapeHtml(player.name)}, ${player.score} cards${out ? ", out" : active ? ", up now" : ""}">
              <span class="score-card__name">${escapeHtml(player.name)}</span>
              <span class="score-card__points">${player.score}</span>
              ${out ? `<button class="btn btn--mint btn--sm score-card__revive" type="button" data-action="revive-player" data-player-id="${player.id}" aria-label="Revive ${escapeHtml(player.name)}">Revive</button>` : ""}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function letterButton(letter, round) {
  const used = round.usedLetters.includes(letter);
  const picked = round.pendingLetters.includes(letter);
  const letterState = used ? "used" : picked ? "picked" : "ready";
  const disabled = used || round.status !== "running";
  const label = used ? letter + ", used" : picked ? letter + ", picked for this turn" : "Take letter " + letter;
  return `
    <button class="letter" type="button" data-action="mark-letter" data-letter="${letter}" data-state="${letterState}" aria-label="${label}" ${disabled ? "disabled" : ""}>
      <span class="letter__glyph">${letter}</span>
    </button>
  `;
}

function board() {
  if (!state.round) {
    return `
      <section class="board board--welcome" id="game-board" aria-labelledby="welcome-title">
        <div class="welcome-copy">
          <h1 id="welcome-title">Tapple</h1>
        </div>
      </section>
    `;
  }

  const round = state.round;
  if (state.phase === "game-complete") {
    const winner = state.players.find((player) => player.score >= state.settings.winningScore);
    return `
      <section class="board board--result" id="game-board" aria-labelledby="result-title">
        <div class="result-banner"><p class="mono-label">Winner</p><h1 id="result-title">${escapeHtml(winner.name)}</h1></div>
      </section>
    `;
  }

  if (round.status === "overtime") {
    return `
      <section class="board board--overtime" id="game-board" aria-labelledby="overtime-title">
        <div class="overtime-copy"><p class="mono-label">Overtime</p><h1 id="overtime-title">${round.answersRequired + 1} letters per turn</h1></div>
      </section>
    `;
  }

  if (round.status === "complete") {
    const winner = state.players.find((player) => player.id === round.winnerId);
    return `
      <section class="board board--result" id="game-board" aria-labelledby="round-result-title">
        <div class="result-banner"><p class="mono-label">Category winner</p><h1 id="round-result-title">${escapeHtml(winner.name)}</h1></div>
      </section>
    `;
  }

  const active = getActivePlayer(state);
  const ratio = Math.max(0, round.remainingSeconds / state.settings.timerSeconds);
  const urgency = round.remainingSeconds <= 3 ? "high" : round.remainingSeconds <= 6 ? "medium" : "low";

  return `
    <section class="board" id="game-board" aria-label="Current category round">
      <section class="turn-card" data-paused="${round.status === "paused" || round.status === "expired"}">
        <span class="mono-label">Up now</span><h1>${escapeHtml(active.name)}</h1>
        ${round.answersRequired > 1 ? `<div class="turn-card__requirement"><strong>${round.pendingLetters.length}/${round.answersRequired}</strong><span>letters</span></div>` : ""}
      </section>
      <section class="category-card" aria-labelledby="category-prompt">
        <p id="category-prompt">${escapeHtml(round.category.prompt)}</p>
      </section>
      <section class="timer-card" data-status="${round.status}" data-urgency="${urgency}">
        <div class="timer-card__head"><span class="mono-label">Time</span><span class="keeper-mark" aria-hidden="true"><span></span></span></div>
        <p class="timer-card__count" aria-label="${round.remainingSeconds} seconds remaining">${String(round.remainingSeconds).padStart(2, "0")}</p>
        <div class="timer-card__track" aria-hidden="true"><span style="--timer-progress: ${ratio}"></span></div>
      </section>
      <section class="letter-bank" aria-label="Letter bank">
        <div class="letter-grid">${LETTERS.map((letter) => letterButton(letter, round)).join("")}</div>
      </section>
    </section>
  `;
}

function primary() {
  if (!state.round) return { action: "draw-round", label: "Start game", tone: "pear", disabled: false };
  if (state.phase === "game-complete") return { action: "new-game", label: "Play again", tone: "pear", disabled: false };
  return {
    running: null,
    paused: { action: "resume-turn", label: "Resume", tone: "pear", disabled: false },
    overtime: { action: "draw-overtime", label: "Draw overtime", tone: "coral", disabled: false },
    complete: { action: "draw-round", label: "Next round", tone: "pear", disabled: false }
  }[state.round.status];
}

function dock() {
  const action = primary();
  const round = state.round;
  const canSkip = round && ["running", "paused", "complete"].includes(round.status) && state.phase !== "game-complete";
  const canPause = round?.status === "running";
  const canOut = round && ["running", "paused"].includes(round.status) && state.phase === "playing";
  return `
    <section class="action-dock" aria-label="Host controls">
      <div class="action-dock__buttons">
        ${canPause ? `<button class="btn btn--soft" data-action="pause-turn" type="button">Pause</button>` : ""}
        ${canOut ? `<button class="btn btn--coral" data-action="mark-out" type="button">Out</button>` : ""}
        ${canSkip ? `<button class="btn btn--outline" data-action="skip-category" type="button">Skip category</button>` : ""}
        ${action ? `<button class="btn btn--${action.tone} btn--lg" data-action="${action.action}" type="button" ${action.disabled ? "disabled" : ""}>${action.label}</button>` : ""}
      </div>
    </section>
  `;
}

function render() {
  const showFooter = !state.round;
  app.innerHTML = `
    <div class="game-shell">
      <header class="topbar">
        <a class="wordmark" href="../../" aria-label="Return to Game Shelf">Game Shelf <span>/ Tapple</span></a>
        <div class="topbar__actions">
          <button class="nav-link" data-action="open-rules" type="button">Rules</button>
          <button class="nav-link" data-action="open-keys" type="button">Keys</button>
          <button class="nav-link" data-action="open-setup" type="button">Setup</button>
          <button class="nav-link" data-action="open-reset" type="button">New game</button>
          <button class="icon-button" data-action="toggle-fullscreen" type="button" aria-label="${document.fullscreenElement ? "Exit full screen" : "Enter full screen"}" aria-pressed="${Boolean(document.fullscreenElement)}"><span aria-hidden="true">⛶</span></button>
        </div>
      </header>
      <div class="game-content">${scoreBoard()}${board()}${dock()}</div>
      ${showFooter ? `
      <footer class="statement-footer">
        <p class="statement-footer__line">Name it first. Claim the letter.</p>
        <div class="statement-footer__meta">
          <span>Game Shelf</span>
          <span>2–8 players · one shared screen</span>
        </div>
      </footer>` : ""}
      ${toast ? `<div class="toast" role="status">${escapeHtml(toast)}</div>` : ""}
    </div>
  `;
}

function setupDraft() {
  const form = setupDialog.querySelector("form");
  if (!form) return null;
  const data = new FormData(form);
  const count = Number(data.get("playerCount"));
  return {
    count,
    names: Array.from({ length: count }, (_, index) => String(data.get("player-" + index) ?? "").trim()),
    winningScore: Number(data.get("winningScore")),
    timerSeconds: Number(data.get("timerSeconds"))
  };
}

function renderSetup(draft) {
  const names = Array.from({ length: draft.count }, (_, index) => draft.names[index] || "Player " + (index + 1));
  const countOptions = Array.from({ length: 7 }, (_, index) => index + 2).map((count) => `<option value="${count}" ${count === draft.count ? "selected" : ""}>${count} players</option>`).join("");
  const namesMarkup = names.map((name, index) => `<label class="field"><span>Player ${index + 1}</span><input name="player-${index}" value="${escapeHtml(name)}" autocomplete="off" maxlength="24" required></label>`).join("");
  setupDialog.innerHTML = `
    <form class="dialog-card setup-form">
      <div class="dialog-card__head"><div><h2 id="setup-title">Setup</h2></div><button class="icon-button" data-action="close-setup" type="button" aria-label="Close setup">×</button></div>
      <p class="dialog-note">Saving starts a new game.</p>
      <div class="setup-grid">
        <label class="field"><span>Players</span><select name="playerCount">${countOptions}</select></label>
        <label class="field"><span>Cards to win</span><select name="winningScore">${[1, 2, 3, 4, 5].map((score) => `<option value="${score}" ${score === draft.winningScore ? "selected" : ""}>${score} cards</option>`).join("")}</select></label>
        <label class="field"><span>Turn timer</span><select name="timerSeconds"><option value="10" ${draft.timerSeconds === 10 ? "selected" : ""}>10 seconds</option><option value="15" ${draft.timerSeconds === 15 ? "selected" : ""}>15 seconds</option></select></label>
      </div>
      <div class="name-fields">${namesMarkup}</div><p class="form-error" aria-live="polite"></p>
      <div class="dialog-actions"><button class="btn btn--outline" data-action="close-setup" type="button">Cancel</button><button class="btn btn--pear" type="submit">Save setup</button></div>
    </form>
  `;
}

function openSetup() {
  renderSetup({ count: state.players.length, names: state.players.map((player) => player.name), ...state.settings });
  openGuide(setupDialog);
}

function openGuide(dialog, message = "Turn paused while the host checks the guide.") {
  if (state.round?.status === "running") {
    state = pauseTurn(state);
    saveState();
    announce(message);
    render();
  }
  dialog.showModal();
}

function applyAction(action, target) {
  if (action === "open-setup") return openSetup();
  if (action === "close-setup") return setupDialog.close();
  if (action === "open-reset") return openGuide(resetDialog, "Turn paused while the host confirms a new game.");
  if (action === "close-reset") return resetDialog.close();
  if (action === "confirm-reset") {
    resetDialog.close();
    return applyAction("new-game");
  }
  if (action === "open-rules") return openGuide(rulesDialog);
  if (action === "open-keys") return openGuide(keysDialog);
  if (action === "toggle-fullscreen") return toggleFullscreen();
  if (action === "draw-round" || action === "skip-category") return drawRound(false);
  if (action === "draw-overtime") return drawRound(true);
  if (action === "pause-turn") {
    state = pauseTurn(state); announce("Paused."); return commit();
  }
  if (action === "resume-turn") {
    state = resumeTurn(state); announce("Resumed."); return commit();
  }
  if (action === "mark-letter") {
    state = markLetter(state, target.dataset.letter);
    announce(state.round.status === "overtime" ? "Overtime." : getActivePlayer(state).name + " is up.");
    return commit();
  }
  if (action === "mark-out") {
    state = eliminateActivePlayer(state, "group decision"); announce(state.lastEvent?.message); return commit();
  }
  if (action === "timeout-out") {
    state = eliminateActivePlayer(state, "timeout"); announce(state.lastEvent?.message); return commit();
  }
  if (action === "timeout-keep") {
    state = continueExpiredTurn(state); announce(getActivePlayer(state).name + " continues."); return commit();
  }
  if (action === "revive-player") {
    state = revivePlayer(state, target.dataset.playerId);
    announce(state.players.find((player) => player.id === target.dataset.playerId).name + " revived.");
    return commit();
  }
  if (action === "new-game") {
    state = freshGame(state.players.map((player) => player.name), state.settings);
    return commit();
  }
}

function toggleFullscreen() {
  const task = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  task.catch(() => { tell("Fullscreen is not available in this browser."); render(); });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target || target.disabled) return;
  try {
    applyAction(target.dataset.action, target);
  } catch (problem) {
    tell(problem.message);
    render();
  }
});

setupDialog.addEventListener("change", (event) => {
  if (event.target.name === "playerCount") renderSetup(setupDraft());
});

setupDialog.addEventListener("submit", (event) => {
  event.preventDefault();
  const draft = setupDraft();
  try {
    state = freshGame(draft.names, draft);
    setupDialog.close();
    commit();
  } catch (problem) {
    setupDialog.querySelector(".form-error").textContent = problem.message;
  }
});

[setupDialog, resetDialog, rulesDialog, keysDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.addEventListener("fullscreenchange", render);
timeoutDialog.addEventListener("cancel", (event) => event.preventDefault());
document.addEventListener("keydown", (event) => {
  if (rulesDialog.open || keysDialog.open || setupDialog.open || resetDialog.open || timeoutDialog.open || event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key.toUpperCase();
  try {
    if (event.code === "Space") {
      event.preventDefault();
      if (state.round?.status === "running") applyAction("pause-turn");
      else if (state.round?.status === "paused") applyAction("resume-turn");
      return;
    }
    if (state.round?.status === "running" && LETTERS.includes(key)) {
      event.preventDefault();
      applyAction("mark-letter", { dataset: { letter: key } });
    }
  } catch (problem) {
    tell(problem.message);
    render();
  }
});

render();
syncTimer();
syncTimeoutDialog();
