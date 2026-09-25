import test from "node:test";
import assert from "node:assert/strict";
import {
  LETTERS,
  chooseRoundModifier,
  continueExpiredTurn,
  createGame,
  eliminateActivePlayer,
  getActivePlayer,
  getAvailableLetters,
  markLetter,
  pauseTurn,
  replaceCategory,
  resumeTurn,
  revivePlayer,
  startOvertime,
  startRound,
  tickTimer
} from "../game-core.js";

const category = { id: "test-category", prompt: "Something testable" };

function gameWithRound(names = ["Maya", "Sam", "Elena"]) {
  return startRound(createGame({ names }), category);
}

test("creates a 2–8 player game with safe timer defaults", () => {
  const game = createGame({ names: ["Maya", "Sam"] });
  assert.equal(game.players.length, 2);
  assert.equal(game.settings.winningScore, 3);
  assert.equal(game.settings.timerSeconds, 10);
  assert.throws(() => createGame({ names: ["Only one"] }), /2 and 8/);
});

test("starts immediately and advances as soon as a letter is taken", () => {
  let game = gameWithRound();
  assert.equal(game.round.status, "running");
  game = markLetter(game, "a");

  assert.deepEqual(game.round.usedLetters, ["A"]);
  assert.deepEqual(game.round.pendingLetters, []);
  assert.equal(getActivePlayer(game).name, "Sam");
  assert.equal(game.round.status, "running");
  assert.equal(game.round.remainingSeconds, game.settings.timerSeconds);
});

test("does not allow a letter to be reused", () => {
  let game = gameWithRound();
  game = markLetter(game, "b");
  assert.throws(() => markLetter(game, "B"), /already been used/);
});

test("P remains a playable letter and space can pause the running state", () => {
  let game = gameWithRound();
  game = markLetter(game, "P");
  assert.deepEqual(game.round.usedLetters, ["P"]);
  game = pauseTurn(game);
  assert.equal(game.round.status, "paused");
  game = resumeTurn(game);
  assert.equal(game.round.status, "running");
});

test("timeout holds the turn for a decision and can grant another clock", () => {
  let game = gameWithRound();
  game.round.remainingSeconds = 1;
  game = tickTimer(game);
  assert.equal(game.round.status, "expired");
  assert.equal(game.round.remainingSeconds, 0);
  assert.equal(getActivePlayer(game).name, "Maya");
  game = continueExpiredTurn(game);
  assert.equal(game.round.status, "running");
  assert.equal(game.round.remainingSeconds, game.settings.timerSeconds);
});

test("eliminating players advances immediately and awards the last player a card", () => {
  let game = gameWithRound();
  game = eliminateActivePlayer(game, "timeout");
  assert.equal(getActivePlayer(game).name, "Sam");
  assert.equal(game.round.status, "running");

  game = eliminateActivePlayer(game, "rejected");
  assert.equal(game.phase, "round-complete");
  assert.equal(game.players.find((player) => player.name === "Elena").score, 1);
});

test("reviving an out player restores them in turn order, even after a category win", () => {
  let game = gameWithRound();
  game = eliminateActivePlayer(game);
  game = revivePlayer(game, "player-1");
  assert.deepEqual(game.round.activeIds, ["player-1", "player-2", "player-3"]);
  assert.equal(game.round.status, "running");

  game = eliminateActivePlayer(game);
  game = eliminateActivePlayer(game);
  assert.equal(game.phase, "round-complete");
  game = revivePlayer(game, "player-2");
  assert.equal(game.phase, "playing");
  assert.equal(game.round.status, "paused");
  assert.equal(game.players.find((player) => player.name === "Maya").score, 0);
});

test("overtime resets the full letter bank and raises the answer requirement", () => {
  let game = gameWithRound(["Maya", "Sam"]);
  game.round.usedLetters = LETTERS.slice(0, -1);
  game = markLetter(game, LETTERS.at(-1));
  assert.equal(game.round.status, "overtime");

  game = startOvertime(game, { id: "overtime-category", prompt: "A fresh category" });
  assert.equal(game.round.answersRequired, 2);
  assert.equal(game.round.turnSeconds, 20);
  assert.equal(game.round.usedLetters.length, 0);
  assert.equal(getAvailableLetters(game).length, LETTERS.length);
  assert.equal(game.round.status, "running");
  game = markLetter(game, "A");
  assert.equal(getActivePlayer(game).name, "Sam");
  assert.deepEqual(game.round.pendingLetters, ["A"]);
  game = markLetter(game, "B");
  assert.equal(getActivePlayer(game).name, "Maya");
});

test("the starter rotates each round, while replacing a category keeps the same starter", () => {
  let game = createGame({ names: ["Maya", "Sam", "Elena"] });
  game = startRound(game, category);
  assert.deepEqual(game.round.turnOrder, ["player-1", "player-2", "player-3"]);

  game = markLetter(game, "A");
  game = replaceCategory(game, { id: "replacement", prompt: "A replacement" });
  assert.equal(game.roundNumber, 1);
  assert.equal(getActivePlayer(game).name, "Maya");
  assert.deepEqual(game.round.usedLetters, []);

  game = startRound(game, category);
  assert.deepEqual(game.round.turnOrder, ["player-2", "player-3", "player-1"]);
  game = startRound(game, category);
  assert.deepEqual(game.round.turnOrder, ["player-3", "player-1", "player-2"]);
});

test("overtime starts earlier when more players need the remaining letters", () => {
  const used = LETTERS.slice(0, 16);
  let twoPlayers = gameWithRound(["Maya", "Sam"]);
  twoPlayers.round.usedLetters = [...used];
  twoPlayers.round.turnsTaken = 2;
  twoPlayers = markLetter(twoPlayers, "Q");
  assert.equal(twoPlayers.round.status, "running");

  let fivePlayers = gameWithRound(["Maya", "Sam", "Elena", "Kai", "Rae"]);
  fivePlayers.round.usedLetters = [...used];
  fivePlayers.round.turnsTaken = 5;
  fivePlayers = markLetter(fivePlayers, "Q");
  assert.equal(fivePlayers.round.status, "overtime");
});

test("hard-to-use letters trigger overtime before the bank is empty", () => {
  const remaining = new Set(["P", "Q", "R", "S", "U", "V", "W", "X", "Y", "Z"]);
  let game = gameWithRound();
  game.round.usedLetters = LETTERS.filter((letter) => !remaining.has(letter));
  game.round.turnsTaken = 3;
  game = markLetter(game, "P");
  assert.equal(game.round.status, "overtime");
  assert.equal(getAvailableLetters(game).length, 9);
});

test("rare modifiers wait until round three and never appear back to back", () => {
  const game = createGame({ names: ["Maya", "Sam"] });
  assert.equal(chooseRoundModifier(game, () => 0.01), null);
  assert.equal(chooseRoundModifier({ ...game, roundNumber: 1 }, () => 0.01), null);
  assert.deepEqual(chooseRoundModifier({ ...game, roundNumber: 2 }, () => 0.01), { type: "double" });
  assert.equal(chooseRoundModifier({ ...game, roundNumber: 2 }, () => 0.9), null);
  assert.equal(chooseRoundModifier({ ...game, roundNumber: 3, lastModifierRound: 3 }, () => 0.01), null);
  const rolls = [0.04, 0];
  const open = chooseRoundModifier({ ...game, roundNumber: 2 }, () => rolls.shift());
  assert.equal(open.type, "open-letter");
  assert.match(open.letter, /^[A-Z]$/);
  assert.deepEqual(chooseRoundModifier({ ...game, roundNumber: 2 }, () => 0.075), { type: "category-swap" });
  assert.deepEqual(chooseRoundModifier({ ...game, roundNumber: 2 }, () => 0.105), { type: "speed-laps" });
});

test("category swap changes the prompt after the first lap without restoring letters", () => {
  const second = { id: "second", prompt: "A different topic" };
  let game = startRound(createGame({ names: ["Maya", "Sam", "Elena"] }), category, { type: "category-swap", category: second });
  game = markLetter(game, "A");
  game = markLetter(game, "B");
  assert.equal(game.round.category.id, category.id);
  game = markLetter(game, "C");
  assert.equal(game.round.category.id, second.id);
  assert.deepEqual(game.round.usedLetters, ["A", "B", "C"]);
  assert.equal(getActivePlayer(game).name, "Maya");
  game = markLetter(game, "D");
  assert.equal(game.round.category.id, second.id);
});

test("skipping a category-swap phase replaces both prompts and restarts its lap", () => {
  const second = { id: "second", prompt: "A different topic" };
  const replacement = { id: "replacement", prompt: "A new first topic" };
  const later = { id: "later", prompt: "A new second topic" };
  let game = startRound(createGame({ names: ["Maya", "Sam"] }), category, { type: "category-swap", category: second });
  game = markLetter(game, "A");
  game = replaceCategory(game, replacement, later);
  assert.equal(game.round.category.id, replacement.id);
  assert.deepEqual(game.round.usedLetters, []);
  assert.equal(getActivePlayer(game).name, "Maya");
  game = markLetter(game, "B");
  game = markLetter(game, "C");
  assert.equal(game.round.category.id, later.id);
});

test("speed laps shorten the next turn clock by two seconds per lap, then stop", () => {
  let game = startRound(createGame({ names: ["Maya", "Sam"] }), category, { type: "speed-laps" });
  game = markLetter(game, "A");
  assert.equal(game.round.turnSeconds, 10);
  game = markLetter(game, "B");
  assert.equal(game.round.turnSeconds, 8);
  assert.equal(game.round.remainingSeconds, 8);
  game = markLetter(game, "C");
  game = markLetter(game, "D");
  assert.equal(game.round.turnSeconds, 6);
  game = markLetter(game, "E");
  game = markLetter(game, "F");
  assert.equal(game.round.turnSeconds, 6);
  game.round.remainingSeconds = 1;
  game = continueExpiredTurn(tickTimer(game));
  assert.equal(game.round.remainingSeconds, 6);
  game = replaceCategory(game, { id: "new", prompt: "A fresh topic" });
  assert.equal(game.round.turnSeconds, 10);
});

test("an elimination keeps its out announcement during a speed lap", () => {
  let game = startRound(createGame({ names: ["Maya", "Sam", "Elena"] }), category, { type: "speed-laps" });
  game = eliminateActivePlayer(game);
  assert.equal(game.lastEvent.type, "player-out");
  assert.equal(game.lastEvent.message, "Maya is out.");
});

test("speed laps shorten only after each surviving player gets the same number of turns", () => {
  let game = startRound(createGame({ names: ["Maya", "Sam", "Elena"] }), category, { type: "speed-laps" });
  game = eliminateActivePlayer(game);
  game = markLetter(game, "A");
  game = markLetter(game, "B");
  assert.equal(game.round.turnSeconds, 8);
  game = markLetter(game, "C");
  assert.equal(game.round.turnSeconds, 8);
  game = markLetter(game, "D");
  assert.equal(game.round.turnSeconds, 6);
});

test("speed laps never increase a short custom timer", () => {
  let game = startRound(createGame({ names: ["Maya", "Sam"], timerSeconds: 5 }), category, { type: "speed-laps" });
  game = markLetter(game, "A");
  game = markLetter(game, "B");
  assert.equal(game.round.turnSeconds, 5);
});

test("an elimination that finishes a category-swap lap announces both changes", () => {
  const second = { id: "second", prompt: "A different topic" };
  let game = startRound(createGame({ names: ["Maya", "Sam", "Elena"] }), category, { type: "category-swap", category: second });
  game = markLetter(game, "A");
  game = markLetter(game, "B");
  game = eliminateActivePlayer(game);
  assert.equal(game.round.category.id, second.id);
  assert.match(game.lastEvent.message, /Elena is out/);
  assert.match(game.lastEvent.message, /A different topic/);
});

test("double answers get twice the clock and require two different letters", () => {
  let game = startRound(createGame({ names: ["Maya", "Sam"] }), category, { type: "double" });
  assert.equal(game.round.answersRequired, 2);
  assert.equal(game.round.turnSeconds, 20);
  game = markLetter(game, "A");
  assert.equal(getActivePlayer(game).name, "Maya");
  assert.deepEqual(game.round.pendingLetters, ["A"]);
  assert.throws(() => markLetter(game, "A"), /already marked/);
  game = markLetter(game, "B");
  assert.equal(getActivePlayer(game).name, "Sam");
  assert.equal(game.round.remainingSeconds, 20);
});

test("an open letter can be reused, but the round still reaches overtime", () => {
  let game = startRound(createGame({ names: ["Maya", "Sam"] }), category, { type: "open-letter", letter: "S" });
  game = markLetter(game, "S");
  game = markLetter(game, "S");
  assert.deepEqual(game.round.usedLetters, []);
  assert.equal(game.round.turnsTaken, 2);
  game.round.turnsTaken = 11;
  game = markLetter(game, "S");
  assert.equal(game.round.status, "overtime");
  game = startOvertime(game, { id: "overtime-category", prompt: "A fresh category" });
  assert.equal(game.round.openLetter, null);
  assert.equal(game.round.answersRequired, 2);
  assert.equal(game.round.turnSeconds, 20);
});

test("later overtimes keep a feasible two-answer turn", () => {
  let game = gameWithRound(["Maya", "Sam"]);
  game.round.status = "overtime";
  game = startOvertime(game, { id: "overtime-one", prompt: "First overtime" });
  game.round.status = "overtime";
  game = startOvertime(game, { id: "overtime-two", prompt: "Second overtime" });
  assert.equal(game.round.overtime, 2);
  assert.equal(game.round.answersRequired, 2);
  assert.equal(game.round.turnSeconds, 20);
});
