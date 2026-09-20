import test from "node:test";
import assert from "node:assert/strict";
import {
  LETTERS,
  canPass,
  createGame,
  eliminateActivePlayer,
  getActivePlayer,
  getAvailableLetters,
  markLetter,
  passTurn,
  pauseTurn,
  resumeTurn,
  startOvertime,
  startRound,
  startTurn,
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

test("marks an unused letter and passes to the next active player", () => {
  let game = gameWithRound();
  game = startTurn(game);
  game = markLetter(game, "a");

  assert.equal(canPass(game), true);
  assert.deepEqual(game.round.pendingLetters, ["A"]);

  game = passTurn(game);
  assert.deepEqual(game.round.usedLetters, ["A"]);
  assert.equal(getActivePlayer(game).name, "Sam");
  assert.equal(game.round.status, "ready");
});

test("does not allow a letter to be reused", () => {
  let game = gameWithRound();
  game = startTurn(game);
  game = markLetter(game, "b");
  game = passTurn(game);
  game = startTurn(game);

  assert.throws(() => markLetter(game, "B"), /already been used/);
});

test("pauses, resumes, and expires a running turn", () => {
  let game = gameWithRound();
  game = startTurn(game);
  game = pauseTurn(game);
  assert.equal(game.round.status, "paused");
  game = resumeTurn(game);
  game.round.remainingSeconds = 1;
  game = tickTimer(game);
  assert.equal(game.round.status, "expired");
  assert.equal(game.round.remainingSeconds, 0);
});

test("eliminating players advances turns and awards the last player a card", () => {
  let game = gameWithRound();
  game = startTurn(game);
  game = eliminateActivePlayer(game, "timeout");
  assert.equal(getActivePlayer(game).name, "Sam");
  assert.equal(game.round.status, "ready");

  game = startTurn(game);
  game = eliminateActivePlayer(game, "rejected");
  assert.equal(game.phase, "round-complete");
  assert.equal(game.players.find((player) => player.name === "Elena").score, 1);
});

test("overtime resets the full letter bank and raises the answer requirement", () => {
  let game = gameWithRound(["Maya", "Sam"]);
  game.round.usedLetters = LETTERS.slice(0, -1);
  game = startTurn(game);
  game = markLetter(game, LETTERS.at(-1));
  game = passTurn(game);
  assert.equal(game.round.status, "overtime");

  game = startOvertime(game, { id: "overtime-category", prompt: "A fresh category" });
  assert.equal(game.round.answersRequired, 2);
  assert.equal(game.round.usedLetters.length, 0);
  assert.equal(getAvailableLetters(game).length, LETTERS.length);
});
