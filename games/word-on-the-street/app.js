import { CATEGORIES, drawCategory } from "./categories.js";
import {
  STREET_LETTERS, OTHER_LETTERS, acceptWord, acknowledgeIntro, challengeWord, createGame,
  expireTurn, insertLetter, moveLetter, removeLetter, resolveChallenge,
  scoreFor, startTurn, submitWord, viewRow
} from "./game-core.js";
import { insertionIndex } from "./word-tray.js";
import { loadGame, saveGame } from "./storage.js";

const app = document.querySelector("#app");
const liveRegion = document.querySelector("#live-region");
const setupDialog = document.querySelector("#setup-dialog");
const resetDialog = document.querySelector("#reset-dialog");
const rulesDialog = document.querySelector("#rules-dialog");
const introDialog = document.querySelector("#intro-dialog");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

let game = loadGame();
let drag = null;
let suppressClick = false;

function save() {
  saveGame(game);
}

function announce(message) {
  liveRegion.textContent = "";
  requestAnimationFrame(() => { liveRegion.textContent = message; });
}

function viewTeam() {
  return game.phase === "ready" ? game.nextTeam : game.activeTeam;
}

function clockText() {
  if (game.phase !== "composing") return "—";
  return String(Math.max(0, Math.ceil((game.endsAt - Date.now()) / 1000))).padStart(2, "0");
}

function prompt() {
  const heading = game.phase === "won" ? `${game.teams[game.winner]} wins`
    : game.phase === "ready" && game.turnNumber === 0 ? "Word on the Street"
    : game.phase === "ready" ? `${game.teams[game.nextTeam]} next`
    : game.category.prompt;
  const label = game.phase === "review" ? "Review word"
    : game.phase === "challenge" ? "Challenge"
    : game.phase === "composing" ? game.teams[game.activeTeam]
    : game.phase === "won" ? "Winner" : "";
  return `
    <section class="prompt-bar" data-urgent="false" aria-label="Category and clock">
      <div class="prompt-bar__category">${label ? `<span class="mono-label">${escapeHtml(label)}</span>` : ""}<h1>${escapeHtml(heading)}</h1></div>
      <span class="prompt-bar__clock" aria-label="${game.phase === "composing" ? "Seconds remaining" : "Clock stopped"}">${clockText()}</span>
    </section>`;
}

function score(team, active) {
  return `<div class="edge-score" style="--edge-row:${active ? 7 : 1}" data-active="${active}">
    <strong>${escapeHtml(game.teams[team])}</strong><span>${scoreFor(game, team)} / 8</span>
  </div>`;
}

function street() {
  const bottom = viewTeam();
  const top = 1 - bottom;
  const lanes = Array.from({ length: 7 }, (_, index) => {
    const row = index + 1;
    const type = row === 1 || row === 7 ? "capture" : row === 4 ? "median" : "lane";
    const team = row === 1 ? top : row === 7 ? bottom : "";
    return `<div class="street-row" style="--lane-row:${row}" data-lane="${type}" data-team="${team}" aria-hidden="true"></div>`;
  }).join("");
  const tiles = STREET_LETTERS.map((letter, index) => {
    const position = game.positions[letter];
    const unavailable = game.unavailableLetters.includes(letter);
    const owner = Math.abs(position) === 3 ? (position === 3 ? 0 : 1) : "none";
    const row = viewRow(position, bottom);
    const disabled = game.phase !== "composing" || unavailable;
    const label = unavailable ? `${letter}, unavailable this game` : owner === "none" ? `${letter}, street lane ${row}` : `${letter}, captured by ${game.teams[owner]}`;
    return `<button class="street-tile" type="button" style="--column:${index + 1};--row:${row}" data-letter="${letter}" data-owner="${owner}" data-unavailable="${unavailable}" ${unavailable ? "" : `data-source-letter="${letter}"`} aria-label="${escapeHtml(label)}${disabled ? "" : ", add to word"}" ${disabled ? "disabled" : ""}>${letter}</button>`;
  }).join("");
  return `
    <div class="mobile-scores"><span>${escapeHtml(game.teams[top])}: ${scoreFor(game, top)} / 8</span><span>${escapeHtml(game.teams[bottom])}: ${scoreFor(game, bottom)} / 8</span></div>
    <section class="street-board" id="game-board" aria-label="Street board, ${escapeHtml(game.teams[bottom])} at the bottom">
      ${lanes}${score(top, false)}${score(bottom, true)}${tiles}
    </section>`;
}

function workspace() {
  const composing = game.phase === "composing";
  const other = OTHER_LETTERS.map((letter) => {
    const unavailable = game.unavailableLetters.includes(letter);
    return `<button class="extra-tile" type="button" data-unavailable="${unavailable}" ${unavailable ? "" : `data-source-letter="${letter}"`} aria-label="${unavailable ? `${letter}, unavailable this game` : `Add ${letter} to word`}" ${composing && !unavailable ? "" : "disabled"}>${letter}</button>`;
  }).join("");
  const word = game.word.map((letter, index) => `<button class="word-tile" type="button" data-word-index="${index}" aria-label="${letter}, word position ${index + 1}${composing ? ", tap to remove" : ""}" ${composing ? "" : "disabled"}>${letter}</button>`).join("");
  return `<section class="word-workspace" aria-label="Word builder">
    <div class="extra-letters" aria-label="Letters off the street">${other}</div>
    <div class="word-line"><span class="mono-label">Word</span><div class="word-tray" aria-label="Current word" data-target="false">${word}<span class="drop-marker" aria-hidden="true"></span></div></div>
  </section>`;
}

function actions() {
  let buttons;
  if (game.phase === "ready") {
    const exhausted = game.drawProgress.seen.length >= CATEGORIES.length;
    buttons = `<button class="btn btn--pear btn--lg" data-action="start-turn" type="button" ${exhausted ? "disabled" : ""}>${exhausted ? "No categories left" : game.turnNumber ? "Draw category" : "Start game"}</button>`;
  } else if (game.phase === "composing") {
    buttons = `<button class="btn btn--soft" data-action="pass-turn" type="button">Pass</button>
      <button class="btn btn--pear btn--lg" data-action="submit-word" type="button" ${game.word.length < 2 ? "disabled" : ""}>Valid word?</button>`;
  } else if (game.phase === "review") {
    buttons = `<button class="btn btn--outline" data-action="challenge-word" type="button">Challenge</button>
      <button class="btn btn--pear btn--lg" data-action="accept-word" type="button">Accept word</button>`;
  } else if (game.phase === "challenge") {
    buttons = `<button class="btn btn--soft" data-action="verdict-stands" type="button">Word stands</button>
      <button class="btn btn--coral" data-action="verdict-rejected" type="button">Reject word</button>`;
  } else {
    buttons = `<button class="btn btn--pear btn--lg" data-action="play-again" type="button">Play again</button>`;
  }
  return `<section class="action-dock" aria-label="Game actions">${buttons}</section>`;
}

function render() {
  app.innerHTML = `<div class="game-shell" data-has-turn="${game.turnNumber > 0}">
    <header class="topbar">
      <a class="wordmark" href="../../" aria-label="Return to Game Shelf">Game Shelf <span>/ Word on the Street</span></a>
      <div class="topbar__actions">
        <button class="nav-link" data-action="open-rules" type="button">Rules</button>
        <button class="nav-link" data-action="open-setup" type="button">Setup</button>
        <button class="nav-link" data-action="open-reset" type="button">New game</button>
        <button class="icon-button" data-action="toggle-fullscreen" type="button" aria-label="${document.fullscreenElement ? "Exit full screen" : "Enter full screen"}" aria-pressed="${Boolean(document.fullscreenElement)}"><span aria-hidden="true">⛶</span></button>
      </div>
    </header>
    <div class="game-content">${prompt()}${street()}${game.turnNumber === 0 ? "" : workspace()}${actions()}</div>
    ${game.turnNumber === 0 ? `<footer class="statement-footer"><p class="statement-footer__line">Pull eight letters to your side.</p><div class="statement-footer__meta"><span>Game Shelf</span><span>Two teams · one shared screen</span></div></footer>` : ""}
  </div>`;
}

function positionsOnScreen() {
  return Object.fromEntries([...app.querySelectorAll(".street-tile")].map((tile) => [tile.dataset.letter, tile.getBoundingClientRect()]));
}

function animateTiles(before) {
  if (reducedMotion.matches) return;
  for (const tile of app.querySelectorAll(".street-tile")) {
    const old = before[tile.dataset.letter];
    if (!old) continue;
    const current = tile.getBoundingClientRect();
    const dx = old.left - current.left;
    const dy = old.top - current.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    tile.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
      duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    });
  }
}

function update(next, message = "", animate = false) {
  const focused = app.contains(document.activeElement) ? document.activeElement : null;
  const sourceLetter = focused?.dataset.sourceLetter;
  const wordIndex = focused?.dataset.wordIndex === undefined ? null : Number(focused.dataset.wordIndex);
  const removedLetter = wordIndex === null ? null : game.word[wordIndex];
  cancelDrag();
  const before = animate ? positionsOnScreen() : null;
  game = next;
  save();
  render();
  if (game.phase === "composing") {
    const replacement = sourceLetter ? app.querySelector(`[data-source-letter="${sourceLetter}"]`)
      : wordIndex === null ? null
      : game.word.length ? app.querySelector(`[data-word-index="${Math.min(wordIndex, game.word.length - 1)}"]`)
      : app.querySelector(`[data-source-letter="${removedLetter}"]`);
    replacement?.focus({ preventScroll: true });
  }
  if (before) animateTiles(before);
  if (message) announce(message);
  showIntroIfNeeded();
}

function showIntroIfNeeded() {
  if (game.introSeen || introDialog.open) return;
  introDialog.innerHTML = `<div class="dialog-card intro-card">
    <h2 id="intro-title">Unavailable this game</h2>
    <div class="intro-letters" aria-label="Unavailable letters">${game.unavailableLetters.map((letter) => `<span class="intro-letter">${letter}</span>`).join("")}</div>
    <div class="dialog-actions"><button class="btn btn--pear" data-action="acknowledge-intro" type="button">Show board</button></div>
  </div>`;
  introDialog.showModal();
}

function dismissIntro() {
  introDialog.close();
  update(acknowledgeIntro(game));
}

function syncClock() {
  if (game.phase !== "composing") return;
  if (Date.now() >= game.endsAt) {
    update(expireTurn(game), "Time is up. The turn passes.");
    return;
  }
  const clock = app.querySelector(".prompt-bar__clock");
  if (clock) clock.textContent = clockText();
  const bar = app.querySelector(".prompt-bar");
  if (bar) bar.dataset.urgent = Math.ceil((game.endsAt - Date.now()) / 1000) <= 5;
}

function renderSetup() {
  setupDialog.innerHTML = `<form class="dialog-card" id="setup-form">
    <div class="dialog-card__head"><h2 id="setup-title">Setup</h2><button class="icon-button" data-action="close-setup" type="button" aria-label="Close setup">×</button></div>
    <div class="setup-grid">
      <label class="field">Team one<input name="team0" maxlength="24" required value="${escapeHtml(game.teams[0])}"></label>
      <label class="field">Team two<input name="team1" maxlength="24" required value="${escapeHtml(game.teams[1])}"></label>
      <label class="field">Word clock<select name="timer">${[30, 45, 60].map((seconds) => `<option value="${seconds}" ${game.timerSeconds === seconds ? "selected" : ""}>${seconds} seconds</option>`).join("")}</select></label>
    </div>
    <p class="form-error" role="alert"></p>
    <div class="dialog-actions"><button class="btn btn--outline" data-action="close-setup" type="button">Cancel</button><button class="btn btn--pear" type="submit">Start new game</button></div>
  </form>`;
  setupDialog.showModal();
}

function handleAction(action) {
  if (action === "acknowledge-intro") {
    return dismissIntro();
  }
  if (action === "open-rules") return rulesDialog.showModal();
  if (action === "open-setup") return renderSetup();
  if (action === "close-setup") return setupDialog.close();
  if (action === "open-reset") return resetDialog.showModal();
  if (action === "close-reset") return resetDialog.close();
  if (action === "confirm-reset" || action === "play-again") {
    resetDialog.close();
    const fresh = createGame({ names: game.teams, timerSeconds: game.timerSeconds, previousUnavailableLetters: game.unavailableLetters });
    return update(fresh, "New game ready.");
  }
  if (action === "toggle-fullscreen") {
    const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    return request.catch(() => announce("Fullscreen is unavailable.")).finally(render);
  }
  if (action === "start-turn") {
    const { category, progress } = drawCategory(game.drawProgress);
    if (!category) return announce("No categories remain. Start a new game.");
    return update(startTurn({ ...game, drawProgress: progress }, category), `${game.teams[game.nextTeam]}, ${category.prompt}.`);
  }
  if (action === "pass-turn") return update(expireTurn(game), "Turn passed.");
  if (action === "submit-word") {
    syncClock();
    if (game.phase !== "composing") return;
    return update(submitWord(game), `${game.word.join("")} submitted for review.`, true);
  }
  if (action === "accept-word") return update(acceptWord(game), "Word accepted.");
  if (action === "challenge-word") return update(challengeWord(game), "Challenge the word.");
  if (action.startsWith("verdict-")) {
    const verdict = action.slice(8);
    return update(resolveChallenge(game, verdict), `Challenge result: ${verdict}.`, verdict !== "stands");
  }
}

function trayContains(x, y) {
  const tray = app.querySelector(".word-tray");
  if (!tray) return false;
  const rect = tray.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function dragIndex(x, y) {
  const tiles = [...app.querySelectorAll(".word-tile")];
  return insertionIndex(tiles.map((tile) => tile.getBoundingClientRect()), x, y);
}

function setDropMarker(x, y) {
  const tray = app.querySelector(".word-tray");
  const marker = tray?.querySelector(".drop-marker");
  if (!tray || !marker) return;
  const inside = trayContains(x, y);
  tray.dataset.target = inside;
  marker.dataset.visible = inside;
  if (inside) {
    const tiles = [...tray.querySelectorAll(".word-tile")];
    tray.insertBefore(marker, tiles[dragIndex(x, y)] ?? null);
  }
}

function cancelDrag() {
  if (!drag) return;
  drag.ghost?.remove();
  drag.element?.removeAttribute("data-dragging");
  const tray = app.querySelector(".word-tray");
  if (tray) tray.dataset.target = "false";
  const marker = app.querySelector(".drop-marker");
  if (marker) marker.dataset.visible = "false";
  drag = null;
}

function pointerDown(event) {
  if (drag) return;
  const source = event.target.closest("[data-source-letter]");
  const wordTile = event.target.closest("[data-word-index]");
  const element = source ?? wordTile;
  if (!element || game.phase !== "composing" || event.button !== 0) return;
  event.preventDefault();
  element.setPointerCapture(event.pointerId);
  drag = {
    pointerId: event.pointerId,
    kind: source ? "source" : "word",
    letter: source?.dataset.sourceLetter ?? game.word[Number(wordTile.dataset.wordIndex)],
    index: wordTile ? Number(wordTile.dataset.wordIndex) : null,
    element,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    ghost: null
  };
}

function pointerMove(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 7) return;
  if (!drag.moved) {
    drag.moved = true;
    drag.element.dataset.dragging = "true";
    drag.ghost = document.createElement("div");
    drag.ghost.className = "drag-ghost";
    drag.ghost.textContent = drag.letter;
    document.body.append(drag.ghost);
  }
  drag.ghost.style.left = `${event.clientX}px`;
  drag.ghost.style.top = `${event.clientY}px`;
  setDropMarker(event.clientX, event.clientY);
}

function pointerUp(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const current = drag;
  const inside = trayContains(event.clientX, event.clientY);
  const insertion = inside ? dragIndex(event.clientX, event.clientY) : null;
  cancelDrag();
  suppressClick = true;
  setTimeout(() => { suppressClick = false; }, 0);
  if (game.phase !== "composing" || Date.now() >= game.endsAt) { syncClock(); return; }
  let next = null;
  if (!current.moved) {
    next = current.kind === "source" ? insertLetter(game, current.letter) : removeLetter(game, current.index);
  } else if (inside) {
    if (current.kind === "source") next = insertLetter(game, current.letter, insertion);
    else {
      const target = Math.max(0, Math.min(game.word.length - 1, insertion > current.index ? insertion - 1 : insertion));
      if (target !== current.index) next = moveLetter(game, current.index, target);
    }
  } else if (current.kind === "word") next = removeLetter(game, current.index);
  if (next) update(next);
}

function pointerCancel(event) {
  if (drag?.pointerId === event.pointerId) cancelDrag();
}

document.addEventListener("click", (event) => {
  if (suppressClick) { suppressClick = false; return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action) return handleAction(action);
  if (game.phase !== "composing") return;
  const source = event.target.closest("[data-source-letter]");
  if (source) return update(insertLetter(game, source.dataset.sourceLetter));
  const wordTile = event.target.closest("[data-word-index]");
  if (wordTile) return update(removeLetter(game, Number(wordTile.dataset.wordIndex)));
});

document.addEventListener("pointerdown", pointerDown);
document.addEventListener("pointermove", pointerMove);
document.addEventListener("pointerup", pointerUp);
document.addEventListener("pointercancel", pointerCancel);

document.addEventListener("keydown", (event) => {
  if (game.phase !== "composing" || event.target.closest("dialog") || event.target.matches("input, select")) return;
  const tile = event.target.closest("[data-word-index]");
  if (tile && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    const from = Number(tile.dataset.wordIndex);
    const to = Math.max(0, Math.min(game.word.length - 1, from + (event.key === "ArrowLeft" ? -1 : 1)));
    if (to !== from) { update(moveLetter(game, from, to)); app.querySelector(`[data-word-index="${to}"]`)?.focus(); }
    return;
  }
  if (tile && ["Delete", "Backspace"].includes(event.key)) {
    event.preventDefault();
    return update(removeLetter(game, Number(tile.dataset.wordIndex)));
  }
  if (event.target.closest("button, a")) return;
  if (/^[a-z]$/i.test(event.key)) {
    event.preventDefault();
    if (game.unavailableLetters.includes(event.key.toUpperCase())) return announce(`${event.key.toUpperCase()} is unavailable this game.`);
    return update(insertLetter(game, event.key));
  }
  if (event.key === "Backspace" && game.word.length) {
    event.preventDefault();
    return update(removeLetter(game, game.word.length - 1));
  }
  if (event.key === "Enter" && game.word.length >= 2) {
    event.preventDefault();
    return handleAction("submit-word");
  }
});

setupDialog.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  try {
    const fresh = createGame({ names: [data.get("team0"), data.get("team1")], timerSeconds: Number(data.get("timer")), previousUnavailableLetters: game.unavailableLetters });
    setupDialog.close();
    update(fresh, "New game ready.");
  } catch (error) {
    setupDialog.querySelector(".form-error").textContent = error.message;
  }
});

for (const dialog of [rulesDialog, setupDialog, resetDialog]) {
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
}
introDialog.addEventListener("cancel", (event) => { event.preventDefault(); dismissIntro(); });
introDialog.addEventListener("click", (event) => { if (event.target === introDialog) dismissIntro(); });
document.addEventListener("fullscreenchange", render);
setInterval(syncClock, 100);
save();
render();
showIntroIfNeeded();
