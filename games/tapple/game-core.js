export const LETTERS = Object.freeze("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));

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
    version: 1,
    phase: "setup",
    settings: { winningScore: scoreTarget, timerSeconds: seconds },
    players: playerNames.map((name, index) => ({ id: "player-" + (index + 1), name, score: 0 })),
    roundNumber: 0,
    round: null,
    lastEvent: null
  };
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

export function startRound(game, category) {
  assert(category?.id && category?.prompt, "Choose a reviewed category.");
  assert(game.phase !== "game-complete", "Start a new game before drawing another category.");

  const next = clone(game);
  const turnOrder = next.players.map((player) => player.id);

  next.phase = "playing";
  next.roundNumber += 1;
  next.round = {
    id: "round-" + next.roundNumber,
    category,
    turnOrder,
    activeIds: [...turnOrder],
    activePlayerId: turnOrder[0],
    usedLetters: [],
    pendingLetters: [],
    answersRequired: 1,
    remainingSeconds: next.settings.timerSeconds,
    status: "ready",
    winnerId: null,
    overtime: 0
  };
  next.lastEvent = { type: "round-started", message: "Category drawn: " + category.prompt };

  return next;
}

export function startTurn(game) {
  const next = clone(game);
  const round = assertRound(next);

  assert(round.status === "ready", "This turn cannot start yet.");
  round.status = "running";
  round.remainingSeconds = next.settings.timerSeconds;
  round.pendingLetters = [];
  next.lastEvent = { type: "turn-started", playerId: round.activePlayerId };

  return next;
}

export function markLetter(game, letter) {
  const next = clone(game);
  const round = assertRound(next);
  const normalized = String(letter).toUpperCase();

  assert(round.status === "running", "Start the turn before choosing a letter.");
  assert(LETTERS.includes(normalized), "Choose a letter from the bank.");
  assert(!round.usedLetters.includes(normalized), normalized + " has already been used.");
  assert(!round.pendingLetters.includes(normalized), normalized + " is already marked for this turn.");
  assert(round.pendingLetters.length < round.answersRequired, "This turn already has the required letters.");

  round.pendingLetters.push(normalized);
  next.lastEvent = { type: "letter-marked", letter: normalized };

  return next;
}

export function passTurn(game) {
  const next = clone(game);
  const round = assertRound(next);

  assert(canPass(next), "Mark the required answer letter before passing.");

  round.usedLetters.push(...round.pendingLetters);
  round.pendingLetters = [];
  round.activePlayerId = nextActiveId(round, round.activePlayerId);
  round.remainingSeconds = next.settings.timerSeconds;

  if (round.usedLetters.length === LETTERS.length && round.activeIds.length > 1) {
    round.status = "overtime";
    next.lastEvent = { type: "overtime-ready", message: "Every letter is used. Draw an overtime category." };
  } else {
    round.status = "ready";
    next.lastEvent = { type: "turn-passed", playerId: round.activePlayerId };
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
  round.remainingSeconds = next.settings.timerSeconds;

  assert(round.activeIds.length >= 1, "A round needs at least one remaining player.");

  if (round.activeIds.length === 1) {
    resolveWinner(next, round);
    return next;
  }

  round.activePlayerId = nextActiveId(round, playerId);
  round.status = "ready";
  const player = getPlayer(next, playerId);
  next.lastEvent = {
    type: "player-out",
    playerId,
    reason,
    message: player.name + " is out. Start the next turn when the board is ready."
  };

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
  round.answersRequired += 1;
  round.remainingSeconds = next.settings.timerSeconds;
  round.status = "ready";
  round.overtime += 1;
  next.lastEvent = {
    type: "overtime-started",
    message: "Overtime " + round.overtime + ": " + round.answersRequired + " letters per turn."
  };

  return next;
}
