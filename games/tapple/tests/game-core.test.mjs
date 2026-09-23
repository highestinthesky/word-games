import test from "node:test";
import assert from "node:assert/strict";
import {
  LETTERS,
  continueExpiredTurn,
  createGame,
  eliminateActivePlayer,
  getActivePlayer,
  getAvailableLetters,
  markLetter,
  pauseTurn,
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
  assert.equal(game.round.usedLetters.length, 0);
  assert.equal(getAvailableLetters(game).length, LETTERS.length);
  assert.equal(game.round.status, "running");
  game = markLetter(game, "A");
  assert.equal(getActivePlayer(game).name, "Sam");
  assert.deepEqual(game.round.pendingLetters, ["A"]);
  game = markLetter(game, "B");
  assert.equal(getActivePlayer(game).name, "Maya");
});
