export const LETTERS = Object.freeze("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
export const OPEN_LETTERS = Object.freeze(["B", "C", "M", "P", "S", "T"]);

const LOW_YIELD_LETTERS = new Set(["Q", "U", "V", "X", "Z"]);
const MODIFIER_RATE = 0.12;

export const DEFAULT_SETTINGS = Object.freeze({
  winningScore: 3,
  timerSeconds: 10
});

function clone(value) {
  return structuredClone(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function cleanPlayerNames(names) {
  assert(Array.isArray(names), "Add player names before starting.");

  const cleaned = names.map((name) => String(name).trim()).filter(Boolean);
  assert(cleaned.length >= 2 && cleaned.length <= 8, "Choose between 2 and 8 players.");
  assert(new Set(cleaned.map((name) => name.toLocaleLowerCase())).size === cleaned.length, "Player names need to be different.");

  return cleaned;
}

function assertRound(game) {
  assert(game.round, "Start a category round first.");
  return game.round;
}

function nextActiveId(round, fromId) {
  const fromIndex = round.turnOrder.indexOf(fromId);

  for (let offset = 1; offset <= round.turnOrder.length; offset += 1) {
    const candidate = round.turnOrder[(fromIndex + offset) % round.turnOrder.length];
    if (round.activeIds.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}

function overtimeIsDue(round) {
  const remaining = LETTERS.filter((letter) => !round.usedLetters.includes(letter));
  if (!remaining.length) return true;
  if (round.turnsTaken < round.minTurnsBeforeOvertime) return false;

  const activeCount = round.activeIds.length;
  const ordinaryRemaining = remaining.filter((letter) => !LOW_YIELD_LETTERS.has(letter)).length;
  const scarceLetters = remaining.length <= Math.min(14, activeCount + 5)
    || ordinaryRemaining <= activeCount + 1;
  const openLetterLimit = round.openLetter
    && round.turnsTaken >= Math.max(12, round.turnOrder.length * 3);
  return scarceLetters || openLetterLimit;
}

function setOvertimeReady(game) {
  game.round.status = "overtime";
  game.lastEvent = { type: "overtime-ready", message: "Few letters remain. Draw an overtime category." };
}

function resolveWinner(game, round) {
  const winnerId = round.activeIds[0];
  const winner = game.players.find((player) => player.id === winnerId);
  winner.score += 1;
  round.status = "complete";
  round.winnerId = winnerId;
  round.pendingLetters = [];
  game.phase = winner.score >= game.settings.winningScore ? "game-complete" : "round-complete";
  game.lastEvent = {
    type: "round-won",
    playerId: winnerId,
    message: winner.score >= game.settings.winningScore
      ? winner.name + " reached the target."
      : winner.name + " earned the category card."
  };
}

export function createGame({ names, winningScore = DEFAULT_SETTINGS.winningScore, timerSeconds = DEFAULT_SETTINGS.timerSeconds }) {
  const playerNames = cleanPlayerNames(names);
  const scoreTarget = Number(winningScore);
  const seconds = Number(timerSeconds);

  assert(Number.isInteger(scoreTarget) && scoreTarget >= 1 && scoreTarget <= 9, "Choose a card target from 1 to 9.");
  assert(Number.isInteger(seconds) && seconds >= 5 && seconds <= 60, "Choose a timer from 5 to 60 seconds.");

  return {
    version: 2,
    phase: "setup",
    settings: { winningScore: scoreTarget, timerSeconds: seconds },
    players: playerNames.map((name, index) => ({ id: "player-" + (index + 1), name, score: 0 })),
    roundNumber: 0,
    lastModifierRound: 0,
    round: null,
    lastEvent: null
  };
}

export function chooseRoundModifier(game, random = Math.random) {
  // The first two rounds establish the base rules. A special round cannot
  // immediately follow another one, regardless of the random roll.
  if (game.roundNumber < 2 || game.lastModifierRound === game.roundNumber) return null;
  const roll = random();
  if (roll >= MODIFIER_RATE) return null;
  if (roll < MODIFIER_RATE / 4) return { type: "double" };
  if (roll < MODIFIER_RATE / 2) return { type: "open-letter", letter: OPEN_LETTERS[Math.floor(random() * OPEN_LETTERS.length)] };
  if (roll < MODIFIER_RATE * 3 / 4) return { type: "category-swap" };
  return { type: "speed-laps" };
}

function applyTurnModifier(game, priorEvent = null) {
  const round = game.round;
  const completedLaps = Math.min(...round.activeIds.map((id) => round.turnCounts[id] ?? 0));
  if (round.modifier === "speed-laps") {
    round.turnSeconds = Math.max(Math.min(6, game.settings.timerSeconds), game.settings.timerSeconds - Math.min(2, completedLaps) * 2);
  }
  if (round.modifier === "category-swap" && !round.swapDone && completedLaps >= 1) {
    round.category = round.swapCategory;
    round.swapDone = true;
    game.lastEvent = { type: "category-swapped", message: (priorEvent?.message ? priorEvent.message + " " : "") + "Category switched to " + round.category.prompt + "." };
    return;
  }
  game.lastEvent = priorEvent ?? { type: "turn-passed", playerId: round.activePlayerId };
}

export function getPlayer(game, playerId) {
  return game.players.find((player) => player.id === playerId) ?? null;
}

export function getActivePlayer(game) {
  if (!game.round) {
    return null;
  }

  return getPlayer(game, game.round.activePlayerId);
}

export function getAvailableLetters(game) {
  const used = new Set(game.round?.usedLetters ?? []);
  return LETTERS.filter((letter) => !used.has(letter));
}

export function canPass(game) {
  return Boolean(
    game.round
      && game.round.status === "running"
      && game.round.pendingLetters.length >= game.round.answersRequired
  );
}

export function startRound(game, category, modifier = null) {
  assert(category?.id && category?.prompt, "Choose a reviewed category.");
  assert(game.phase !== "game-complete", "Start a new game before drawing another category.");
  assert(!modifier || ["double", "open-letter", "category-swap", "speed-laps"].includes(modifier.type), "Choose a known round modifier.");
  assert(modifier?.type !== "open-letter" || OPEN_LETTERS.includes(modifier.letter), "Choose a common open letter.");
  assert(modifier?.type !== "category-swap" || (modifier.category?.id && modifier.category?.prompt && modifier.category.id !== category.id), "Choose a different second category.");

  const next = clone(game);
  const playerIds = next.players.map((player) => player.id);
  const starterIndex = next.roundNumber % playerIds.length;
  const turnOrder = [...playerIds.slice(starterIndex), ...playerIds.slice(0, starterIndex)];
  const answersRequired = modifier?.type === "double" ? 2 : 1;
  const turnSeconds = next.settings.timerSeconds * answersRequired;

  next.phase = "playing";
  next.roundNumber += 1;
  if (modifier) next.lastModifierRound = next.roundNumber;
  next.round = {
    id: "round-" + next.roundNumber,
    category,
    turnOrder,
    activeIds: [...turnOrder],
    activePlayerId: turnOrder[0],
    phaseActiveIds: [...turnOrder],
    phaseStarterId: turnOrder[0],
    usedLetters: [],
    pendingLetters: [],
    answersRequired,
    turnSeconds,
    remainingSeconds: turnSeconds,
    modifier: modifier?.type ?? null,
    openLetter: modifier?.type === "open-letter" ? modifier.letter : null,
    swapCategory: modifier?.type === "category-swap" ? modifier.category : null,
    swapDone: false,
    turnCounts: Object.fromEntries(turnOrder.map((id) => [id, 0])),
    turnsTaken: 0,
    minTurnsBeforeOvertime: turnOrder.length,
    status: "running",
    winnerId: null,
    overtime: 0
  };
  next.lastEvent = { type: "round-started", message: "Category drawn: " + category.prompt };

  return next;
}

export function replaceCategory(game, category, swapCategory = null) {
  assert(category?.id && category?.prompt, "Choose a reviewed category.");
  const next = clone(game);
  const round = assertRound(next);
  assert(["running", "paused", "expired"].includes(round.status), "Replace a category while it is in play.");
  assert(round.modifier !== "category-swap" || (swapCategory?.id && swapCategory?.prompt && swapCategory.id !== category.id), "Choose a different second category.");

  round.category = category;
  round.swapCategory = round.modifier === "category-swap" ? swapCategory : null;
  round.swapDone = false;
  round.activeIds = [...round.phaseActiveIds];
  round.activePlayerId = round.phaseStarterId;
  round.usedLetters = [];
  round.pendingLetters = [];
  round.turnSeconds = next.settings.timerSeconds * round.answersRequired;
  round.remainingSeconds = round.turnSeconds;
  round.turnsTaken = 0;
  round.turnCounts = Object.fromEntries(round.turnOrder.map((id) => [id, 0]));
  round.minTurnsBeforeOvertime = round.activeIds.length;
  round.status = "running";
  next.lastEvent = { type: "category-replaced", message: "Category drawn: " + category.prompt };
  return next;
}

export function markLetter(game, letter) {
  const next = clone(game);
  const round = assertRound(next);
  const normalized = String(letter).toUpperCase();

  assert(round.status === "running", "Letters are available while the clock runs.");
  assert(LETTERS.includes(normalized), "Choose a letter from the bank.");
  assert(normalized === round.openLetter || !round.usedLetters.includes(normalized), normalized + " has already been used.");
  assert(!round.pendingLetters.includes(normalized), normalized + " is already marked for this turn.");
  assert(round.pendingLetters.length < round.answersRequired, "This turn already has the required letters.");

  round.pendingLetters.push(normalized);
  next.lastEvent = { type: "letter-marked", letter: normalized };

  return canPass(next) ? passTurn(next) : next;
}

export function passTurn(game) {
  const next = clone(game);
  const round = assertRound(next);

  assert(canPass(next), "Mark the required answer letter before passing.");

  round.usedLetters.push(...round.pendingLetters.filter((letter) => letter !== round.openLetter));
  round.pendingLetters = [];
  round.turnCounts[round.activePlayerId] = (round.turnCounts[round.activePlayerId] ?? 0) + 1;
  round.turnsTaken += 1;
  round.activePlayerId = nextActiveId(round, round.activePlayerId);

  if (round.activeIds.length > 1 && overtimeIsDue(round)) {
    setOvertimeReady(next);
  } else {
    applyTurnModifier(next);
    round.remainingSeconds = round.turnSeconds;
    round.status = "running";
  }

  return next;
}

export function pauseTurn(game) {
  const next = clone(game);
  const round = assertRound(next);
  assert(round.status === "running", "Only a running turn can be paused.");
  round.status = "paused";
  next.lastEvent = { type: "turn-paused", playerId: round.activePlayerId };
  return next;
}

export function resumeTurn(game) {
  const next = clone(game);
  const round = assertRound(next);
  assert(round.status === "paused", "Only a paused turn can be resumed.");
  round.status = "running";
  next.lastEvent = { type: "turn-resumed", playerId: round.activePlayerId };
  return next;
}

export function continueExpiredTurn(game) {
  const next = clone(game);
  const round = assertRound(next);
  assert(round.status === "expired", "Only an expired turn can continue.");
  round.status = "running";
  round.remainingSeconds = round.turnSeconds;
  next.lastEvent = { type: "timeout-overruled", playerId: round.activePlayerId };
  return next;
}

export function tickTimer(game) {
  const next = clone(game);
  const round = assertRound(next);

  if (round.status !== "running") {
    return next;
  }

  round.remainingSeconds = Math.max(0, round.remainingSeconds - 1);

  if (round.remainingSeconds === 0) {
    round.status = "expired";
    next.lastEvent = { type: "turn-expired", playerId: round.activePlayerId };
  }

  return next;
}

export function eliminateActivePlayer(game, reason = "out") {
  const next = clone(game);
  const round = assertRound(next);
  const playerId = round.activePlayerId;

  assert(["running", "paused", "expired"].includes(round.status), "Only the active player can be marked out now.");

  round.activeIds = round.activeIds.filter((id) => id !== playerId);
  round.pendingLetters = [];
  round.turnCounts[playerId] = (round.turnCounts[playerId] ?? 0) + 1;
  round.turnsTaken += 1;

  assert(round.activeIds.length >= 1, "A round needs at least one remaining player.");

  if (round.activeIds.length === 1) {
    resolveWinner(next, round);
    return next;
  }

  round.activePlayerId = nextActiveId(round, playerId);
  const player = getPlayer(next, playerId);
  next.lastEvent = {
    type: "player-out",
    playerId,
    reason,
    message: player.name + " is out."
  };

  if (overtimeIsDue(round)) setOvertimeReady(next);
  else {
    applyTurnModifier(next, next.lastEvent);
    round.remainingSeconds = round.turnSeconds;
    round.status = "running";
  }

  return next;
}

export function startOvertime(game, category) {
  const next = clone(game);
  const round = assertRound(next);

  assert(round.status === "overtime", "Overtime is not ready yet.");
  assert(category?.id && category?.prompt, "Choose a reviewed overtime category.");

  round.category = category;
  round.usedLetters = [];
  round.pendingLetters = [];
  round.answersRequired = 2;
  round.turnSeconds = next.settings.timerSeconds * 2;
  round.remainingSeconds = round.turnSeconds;
  round.modifier = null;
  round.openLetter = null;
  round.swapCategory = null;
  round.swapDone = false;
  round.turnsTaken = 0;
  round.turnCounts = Object.fromEntries(round.turnOrder.map((id) => [id, 0]));
  round.minTurnsBeforeOvertime = round.activeIds.length;
  round.phaseActiveIds = [...round.activeIds];
  round.phaseStarterId = round.activePlayerId;
  round.status = "running";
  round.overtime += 1;
  next.lastEvent = {
    type: "overtime-started",
    message: "Overtime " + round.overtime + ": two answers per turn."
  };

  return next;
}

export function revivePlayer(game, playerId) {
  const next = clone(game);
  const round = assertRound(next);
  assert(round.turnOrder.includes(playerId), "Choose a player in this round.");
  assert(!round.activeIds.includes(playerId), "That player is already in.");

  if (round.status === "complete") {
    const winner = getPlayer(next, round.winnerId);
    winner.score -= 1;
    round.winnerId = null;
    next.phase = "playing";
    round.status = "paused";
  }

  round.activeIds.push(playerId);
  round.activeIds.sort((a, b) => round.turnOrder.indexOf(a) - round.turnOrder.indexOf(b));
  if (!round.phaseActiveIds.includes(playerId)) {
    round.phaseActiveIds.push(playerId);
    round.phaseActiveIds.sort((a, b) => round.turnOrder.indexOf(a) - round.turnOrder.indexOf(b));
  }
  next.lastEvent = { type: "player-revived", playerId };
  return next;
}
