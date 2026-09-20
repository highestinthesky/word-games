import { CLASSROOM_SAFE_PACK, getCategoryById, shuffleCategories } from "./categories.js";
import {
  LETTERS,
  canPass,
  createGame,
  eliminateActivePlayer,
  getActivePlayer,
  markLetter,
  passTurn,
  pauseTurn,
  resumeTurn,
  startOvertime,
  startRound,
  startTurn,
  tickTimer
} from "./game-core.js";

const STORAGE_KEY = "word-games:category-sprint:v1";
const DEFAULT_NAMES = ["Team 1", "Team 2", "Team 3"];
const app = document.querySelector("#app");
const liveRegion = document.querySelector("#live-region");
const setupDialog = document.querySelector("#setup-dialog");
const rulesDialog = document.querySelector("#rules-dialog");
const keysDialog = document.querySelector("#keys-dialog");

let state = loadState();
let toast = "";
let burst = false;
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
  let bag = Array.isArray(state.drawBag) ? [...state.drawBag] : [];
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
  burst = false;
  tell(state.lastEvent?.message ?? "Category ready.");
  commit();
}

function commit() {
  saveState();
  syncTimer();
  render();
}

function syncTimer() {
  window.clearInterval(timerId);
  timerId = null;
  if (state.round?.status !== "running") return;
  timerId = window.setInterval(() => {
    state = tickTimer(state);
    if (state.round.status === "expired") {
      state = eliminateActivePlayer(state, "time ran out");
      tell(state.lastEvent?.message);
    }
    commit();
  }, 1000);
}

function statusLabel(round) {
  const labels = {
    ready: "Waiting for host",
    running: "Clock is running",
    paused: "Group decision paused",
    overtime: "Overtime ready",
    complete: "Round complete"
  };
  return labels[round?.status] ?? "Ready to set up";
}

function scoreBoard() {
  return `
    <section class="scoreboard" aria-label="Scores">
      <div class="scoreboard__title"><span class="mono-label">First to ${state.settings.winningScore}</span><strong>Category cards</strong></div>
      <div class="scoreboard__players">
        ${state.players.map((player, index) => {
          const active = state.round?.activePlayerId === player.id;
          const out = state.round && !state.round.activeIds.includes(player.id);
          return `
            <article class="score-card" data-accent="${index % 4}" data-active="${active}" data-out="${out}">
              <span class="score-card__name">${escapeHtml(player.name)}</span>
              <span class="score-card__points">${player.score}</span>
              <span class="score-card__state">${out ? "Out this round" : active ? "Up now" : "In round"}</span>
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
  const label = used ? letter + ", used" : picked ? letter + ", picked for this turn" : "Use letter " + letter;
  return `
    <button class="letter" type="button" data-action="mark-letter" data-letter="${letter}" data-state="${letterState}" aria-label="${label}" ${disabled ? "disabled" : ""}>
      <span class="letter__glyph">${letter}</span><span class="letter__state">${used ? "Used" : picked ? "Picked" : "Ready"}</span>
    </button>
  `;
}

function board() {
  if (!state.round) {
    return `
      <section class="board board--welcome" id="game-board" aria-labelledby="welcome-title">
        <div class="welcome-copy">
          <p class="mono-label">One board. One host. Everyone plays.</p>
          <h1 id="welcome-title">Set the room.</h1>
          <p>Choose names, then draw a reviewed category. Players answer aloud while one person runs the board.</p>
          <button class="btn btn--outline btn--sm" data-action="open-rules" type="button">How to play</button>
        </div>
        <div class="welcome-map" aria-label="Game flow"><span>Speak</span><i aria-hidden="true"></i><span>Tap</span><i aria-hidden="true"></i><span>Pass</span></div>
      </section>
    `;
  }

  const round = state.round;
  if (state.phase === "game-complete") {
    const winner = state.players.find((player) => player.score >= state.settings.winningScore);
    return `
      <section class="board board--result" id="game-board" aria-labelledby="result-title">
        <div class="result-banner"><p class="mono-label">Game complete</p><h1 id="result-title">${escapeHtml(winner.name)} takes the shelf.</h1><p>${winner.score} category cards earned. Start fresh when the group is ready.</p></div>
      </section>
    `;
  }

  if (round.status === "overtime") {
    return `
      <section class="board board--overtime" id="game-board" aria-labelledby="overtime-title">
        <div class="overtime-copy"><p class="mono-label">Letter bank exhausted</p><h1 id="overtime-title">Overtime changes the pressure.</h1><p>Draw a new category. Each player now needs <strong>${round.answersRequired + 1} different letters</strong> before passing.</p></div>
        <div class="overtime-map" aria-hidden="true"><span>${round.answersRequired}</span><b>→</b><span>${round.answersRequired + 1}</span></div>
      </section>
    `;
  }

  if (round.status === "complete") {
    const winner = state.players.find((player) => player.id === round.winnerId);
    return `
      <section class="board board--result" id="game-board" aria-labelledby="round-result-title">
        <div class="result-banner"><p class="mono-label">Category claimed</p><h1 id="round-result-title">${escapeHtml(winner.name)} gets this card.</h1><p>The next category starts with a fresh letter bank and everyone back in.</p></div>
      </section>
    `;
  }

  const active = getActivePlayer(state);
  const ratio = Math.max(0, round.remainingSeconds / state.settings.timerSeconds);
  const urgency = round.remainingSeconds <= 3 ? "high" : round.remainingSeconds <= 6 ? "medium" : "low";

  return `
    <section class="board" id="game-board" aria-label="Current category round">
      <section class="turn-card" data-paused="${round.status === "paused"}">
        <span class="mono-label">Up now</span><h1>${escapeHtml(active.name)}</h1><p>${round.activeIds.length} players still in this category</p>
        <div class="turn-card__requirement"><span>Need</span><strong>${round.answersRequired}</strong><span>letter${round.answersRequired === 1 ? "" : "s"}</span></div>
      </section>
      <section class="category-card" aria-labelledby="category-prompt">
        <div class="category-card__head"><span class="mono-label">${escapeHtml(CLASSROOM_SAFE_PACK.name)}</span><span class="difficulty">${escapeHtml(round.category.difficulty)}</span></div>
        <p id="category-prompt">${escapeHtml(round.category.prompt)}</p>
        <span class="category-card__round">Round ${state.roundNumber} · Overtime ${round.overtime}</span>
      </section>
      <section class="timer-card" data-status="${round.status}" data-urgency="${urgency}">
        <div class="timer-card__head"><span class="mono-label">Time left</span><span class="keeper-mark" aria-hidden="true"><span></span></span></div>
        <p class="timer-card__count" aria-label="${round.remainingSeconds} seconds remaining">${String(round.remainingSeconds).padStart(2, "0")}</p>
        <div class="timer-card__track" aria-hidden="true"><span style="--timer-progress: ${ratio}"></span></div>
        <p class="timer-card__status">${statusLabel(round)}</p>
      </section>
      <section class="letter-bank" aria-label="Letter bank">
        <div class="letter-bank__head"><div><span class="mono-label">Letter map</span><p>${round.status === "running" ? "Tap the starting letter after the answer is spoken." : "Start the turn to make letters available."}</p></div><span class="letter-bank__count">${LETTERS.length - round.usedLetters.length} left</span></div>
        <div class="letter-grid">${LETTERS.map((letter) => letterButton(letter, round)).join("")}</div>
      </section>
    </section>
  `;
}

function primary() {
  if (!state.round) return { action: "draw-round", label: "Start game", tone: "pear", disabled: false };
  if (state.phase === "game-complete") return { action: "new-game", label: "Play again", tone: "pear", disabled: false };
  return {
    ready: { action: "start-turn", label: "Start turn", tone: "pear", disabled: false },
    running: { action: "pass-turn", label: "Pass turn", tone: "pear", disabled: !canPass(state) },
    paused: { action: "resume-turn", label: "Resume turn", tone: "cyan", disabled: false },
    overtime: { action: "draw-overtime", label: "Draw overtime", tone: "coral", disabled: false },
    complete: { action: "draw-round", label: "Next round", tone: "pear", disabled: false }
  }[state.round.status];
}

function dock() {
  const action = primary();
  const round = state.round;
  const canSkip = round && ["ready", "complete"].includes(round.status) && state.phase !== "game-complete";
  const canPause = round?.status === "running";
  const canOut = round && ["running", "paused"].includes(round.status) && state.phase === "playing";
  return `
    <section class="action-dock" aria-label="Host controls">
      <div class="action-dock__hint"><span class="mono-label">Host control</span><p>${round?.status === "running" ? "Tap a letter, then pass it on." : "The timer only runs after you start a turn."}</p></div>
      <div class="action-dock__buttons">
        ${canPause ? `<button class="btn btn--soft" data-action="pause-turn" type="button">Pause</button>` : ""}
        ${canOut ? `<button class="btn btn--coral" data-action="mark-out" type="button">Mark out</button>` : ""}
        ${canSkip ? `<button class="btn btn--outline" data-action="skip-category" type="button">Skip category</button>` : ""}
        <button class="btn btn--${action.tone} btn--lg" data-action="${action.action}" type="button" ${action.disabled ? "disabled" : ""}>${action.label}</button>
      </div>
    </section>
  `;
}

function render() {
  const showFooter = !state.round;
  app.innerHTML = `
    <div class="game-shell">
      <header class="topbar">
        <a class="wordmark" href="../../" aria-label="Return to Game Shelf">Game Shelf <span>/ Category Sprint</span></a>
        <div class="topbar__actions">
          <button class="nav-link" data-action="open-rules" type="button">Rules</button>
          <button class="nav-link" data-action="open-keys" type="button">Keys</button>
          <span class="nav-note">Classroom Safe · no phones</span>
          <button class="btn btn--outline btn--sm" data-action="open-setup" type="button">Setup</button>
          <button class="icon-button" data-action="toggle-fullscreen" type="button" aria-label="${document.fullscreenElement ? "Exit full screen" : "Enter full screen"}" aria-pressed="${Boolean(document.fullscreenElement)}"><span aria-hidden="true">⛶</span></button>
        </div>
      </header>
      <div class="game-content">${scoreBoard()}${board()}${dock()}</div>
      ${showFooter ? `
      <footer class="statement-footer">
        <p class="statement-footer__line">The group is the referee.</p>
        <div class="statement-footer__meta">
          <span>Game Shelf</span>
          <span>Classroom Safe · no phones</span>
        </div>
      </footer>` : ""}
      ${toast ? `<div class="toast" role="status">${escapeHtml(toast)}</div>` : ""}${burst ? `<span class="success-burst" aria-hidden="true"></span>` : ""}
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
  const names = Array.from({ length: draft.count }, (_, index) => draft.names[index] || "Team " + (index + 1));
  const countOptions = Array.from({ length: 7 }, (_, index) => index + 2).map((count) => `<option value="${count}" ${count === draft.count ? "selected" : ""}>${count} players</option>`).join("");
  const namesMarkup = names.map((name, index) => `<label class="field"><span>Player ${index + 1}</span><input name="player-${index}" value="${escapeHtml(name)}" autocomplete="off" maxlength="24" required></label>`).join("");
  setupDialog.innerHTML = `
    <form class="dialog-card setup-form">
      <div class="dialog-card__head"><div><p class="mono-label">Host setup</p><h2 id="setup-title">Set the room up.</h2></div><button class="icon-button" data-action="close-setup" type="button" aria-label="Close setup">×</button></div>
      <p class="dialog-note">Saving starts a fresh game and clears the current round.</p>
      <div class="setup-grid">
        <label class="field"><span>Players</span><select name="playerCount">${countOptions}</select></label>
        <label class="field"><span>Cards to win</span><select name="winningScore">${[1, 2, 3, 4, 5].map((score) => `<option value="${score}" ${score === draft.winningScore ? "selected" : ""}>${score} cards</option>`).join("")}</select></label>
        <label class="field"><span>Turn timer</span><select name="timerSeconds"><option value="10" ${draft.timerSeconds === 10 ? "selected" : ""}>10 seconds · standard</option><option value="15" ${draft.timerSeconds === 15 ? "selected" : ""}>15 seconds · more room</option></select></label>
      </div>
      <div class="name-fields">${namesMarkup}</div><p class="form-error" aria-live="polite"></p>
      <div class="dialog-actions"><button class="btn btn--outline" data-action="close-setup" type="button">Keep playing</button><button class="btn btn--pear" type="submit">Save setup</button></div>
    </form>
  `;
}

function openSetup() {
  renderSetup({ count: state.players.length, names: state.players.map((player) => player.name), ...state.settings });
  setupDialog.showModal();
}

function openGuide(dialog) {
  if (state.round?.status === "running") {
    state = pauseTurn(state);
    saveState();
    announce("Turn paused while the host checks the guide.");
    render();
  }
  dialog.showModal();
}

function applyAction(action, target) {
  if (action === "open-setup") return openSetup();
  if (action === "close-setup") return setupDialog.close();
  if (action === "open-rules") return openGuide(rulesDialog);
  if (action === "open-keys") return openGuide(keysDialog);
  if (action === "toggle-fullscreen") return toggleFullscreen();
  if (action === "draw-round" || action === "skip-category") return drawRound(false);
  if (action === "draw-overtime") return drawRound(true);
  if (action === "start-turn") {
    state = startTurn(state); tell(getActivePlayer(state).name + " is on the clock."); return commit();
  }
  if (action === "pause-turn") {
    state = pauseTurn(state); tell("Timer paused. Let the group decide."); return commit();
  }
  if (action === "resume-turn") {
    state = resumeTurn(state); tell("Timer resumed."); return commit();
  }
  if (action === "mark-letter") {
    state = markLetter(state, target.dataset.letter); tell(target.dataset.letter + " marked."); return commit();
  }
  if (action === "pass-turn") {
    state = passTurn(state); burst = true; tell(state.lastEvent?.message ?? "Turn passed.");
    window.setTimeout(() => { burst = false; render(); }, 420);
    return commit();
  }
  if (action === "mark-out") {
    state = eliminateActivePlayer(state, "group decision"); tell(state.lastEvent?.message); return commit();
  }
  if (action === "new-game") {
    state = freshGame(state.players.map((player) => player.name), state.settings);
    tell("Fresh game ready. Draw a category when the room is set.");
    return commit();
  }
}

function toggleFullscreen() {
  const task = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  task.catch(() => { tell("Fullscreen is not available in this browser."); render(); });
}

app.addEventListener("click", (event) => {
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
    tell("Setup saved. Draw a category when everyone is ready.");
    commit();
  } catch (problem) {
    setupDialog.querySelector(".form-error").textContent = problem.message;
  }
});

document.addEventListener("fullscreenchange", render);
document.addEventListener("keydown", (event) => {
  if (rulesDialog.open || keysDialog.open || setupDialog.open || event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key.toUpperCase();
  try {
    if (event.code === "Space") {
      event.preventDefault();
      if (!state.round) drawRound(false);
      else if (state.round.status === "ready") applyAction("start-turn");
      else if (state.round.status === "running") applyAction("pause-turn");
      else if (state.round.status === "paused") applyAction("resume-turn");
      return;
    }
    if (key === "P" && state.round?.status === "running") { event.preventDefault(); return applyAction("pause-turn"); }
    if (key === "P" && state.round?.status === "paused") { event.preventDefault(); return applyAction("resume-turn"); }
    if (event.key === "Enter" && canPass(state)) { event.preventDefault(); return applyAction("pass-turn"); }
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
