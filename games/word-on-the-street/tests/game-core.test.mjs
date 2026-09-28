import test from "node:test";
import assert from "node:assert/strict";

const core = await import("../game-core.js");
const category = { id: "instruments", prompt: "A musical instrument" };

function running() {
  return core.startTurn(core.acknowledgeIntro(core.createGame({ names: ["North", "South"], unavailableLetters: ["N", "V", "W", "O"] })), category);
}

function word(game, letters) {
  return [...letters].reduce((next, letter) => core.insertLetter(next, letter), game);
}

test("TRUMPET moves T twice while U and E do not move", () => {
  const submitted = core.submitWord(word(running(), "TRUMPET"));
  assert.equal(submitted.phase, "review");
  assert.equal(submitted.positions.T, 2);
  assert.equal(submitted.positions.R, 1);
  assert.equal(submitted.positions.M, 1);
  assert.equal(submitted.positions.P, 1);
  assert.equal(submitted.positions.U, undefined);
});

test("three occurrences capture once and captured consonants remain usable", () => {
  const first = core.acceptWord(core.submitWord(word(running(), "MISSISSIPPI")));
  assert.equal(first.positions.S, 3);
  assert.equal(core.scoreFor(first, 0), 1);
  const second = core.startTurn(first, category);
  const submitted = core.submitWord(word(second, "SASS"));
  assert.equal(submitted.positions.S, 3);
  assert.equal(core.scoreFor(submitted, 0), 1);
});

test("word tray supports duplicate insertion, reorder, and removal", () => {
  const a = word(running(), "CAT");
  const b = core.insertLetter(a, "A", 1);
  assert.equal(b.word.join(""), "CAAT");
  const c = core.moveLetter(b, 3, 0);
  assert.equal(c.word.join(""), "TCAA");
  assert.equal(core.removeLetter(c, 2).word.join(""), "TCA");
});

test("timeout discards the word and forbids a late submission", () => {
  const expired = core.expireTurn(word(running(), "CAT"));
  assert.equal(expired.phase, "ready");
  assert.equal(expired.nextTeam, 1);
  assert.deepEqual(expired.word, []);
  assert.throws(() => core.submitWord(expired), /running turn/i);
});

test("opposing turn views the same positions from the other side", () => {
  const first = core.acceptWord(core.submitWord(word(running(), "CAT")));
  assert.equal(first.positions.C, 1);
  assert.equal(core.viewRow(first.positions.C, 0), 5);
  assert.equal(core.viewRow(first.positions.C, 1), 3);
  const second = core.startTurn(first, category);
  assert.equal(second.activeTeam, 1);
  assert.equal(second.positions.C, 1);
  assert.equal(core.submitWord(word(second, "CAT")).positions.C, 0);
});

test("rejected challenge restores provisional captures and passes the turn", () => {
  const submitted = core.submitWord(word(running(), "MISSISSIPPI"));
  assert.equal(core.scoreFor(submitted, 0), 1);
  const resolved = core.resolveChallenge(core.challengeWord(submitted), "rejected");
  assert.equal(resolved.positions.S, 0);
  assert.equal(core.scoreFor(resolved, 0), 0);
  assert.equal(resolved.nextTeam, 1);
});

test("an upheld challenge keeps the move and gives the challenger its normal turn", () => {
  const submitted = core.submitWord(word(running(), "CAT"));
  const upheld = core.resolveChallenge(core.challengeWord(submitted), "stands");
  assert.equal(upheld.positions.C, 1);
  assert.equal(upheld.nextTeam, 1);
  assert.equal(core.startTurn(upheld, category).activeTeam, 1);
  assert.throws(() => core.resolveChallenge(core.challengeWord(submitted), "tie"), /verdict/i);
});

test("each new game excludes three street consonants and one vowel until acknowledged", () => {
  const unavailable = core.pickUnavailableLetters(() => 0);
  assert.equal(unavailable.length, 4);
  assert.equal(new Set(unavailable).size, 4);
  assert.equal(unavailable.filter((letter) => core.STREET_LETTERS.includes(letter)).length, 3);
  assert.equal(unavailable.filter((letter) => "AEIOU".includes(letter)).length, 1);
  const first = core.createGame({ random: () => 0 });
  const second = core.createGame({ random: () => 0, previousUnavailableLetters: first.unavailableLetters });
  assert.notDeepEqual(second.unavailableLetters, first.unavailableLetters);
  const game = core.createGame({ unavailableLetters: ["N", "V", "W", "O"] });
  assert.equal(game.introSeen, false);
  assert.throws(() => core.startTurn(game, category), /letters/i);
  const ready = core.acknowledgeIntro(game);
  assert.equal(ready.introSeen, true);
  assert.throws(() => core.insertLetter(core.startTurn(ready, category), "N"), /unavailable/i);
  assert.throws(() => core.insertLetter(core.startTurn(ready, category), "O"), /unavailable/i);
  assert.equal(core.insertLetter(core.startTurn(ready, category), "A").word.join(""), "A");
});

test("eight accepted captures end the game", () => {
  let game = running();
  game = { ...game, positions: { ...game.positions, B: 2, C: 2, D: 2, F: 2, G: 2, H: 2, K: 2, L: 2 } };
  const won = core.acceptWord(core.submitWord(word(game, "BCDFGHKL")));
  assert.equal(core.scoreFor(won, 0), 8);
  assert.equal(won.phase, "won");
  assert.equal(won.winner, 0);
});

test("restoring malformed saved state falls back safely", () => {
  assert.equal(core.restoreGame({ phase: "review", positions: {} }), null);
  const game = running();
  assert.deepEqual(core.restoreGame(JSON.parse(JSON.stringify(game))), game);

  const review = core.submitWord(word(game, "CAT"));
  assert.equal(core.restoreGame({ ...review, reviewSnapshot: { ...review.reviewSnapshot, C: 99 } }), null);
  assert.equal(core.restoreGame({ ...review, category: null }), null);
  assert.equal(core.restoreGame({ ...review, phase: "won", winner: 3 }), null);
  assert.equal(core.restoreGame({ ...review, phase: "won", winner: 0 }), null);
  assert.equal(core.restoreGame({ ...review, unavailableLetters: ["C", "C", "T", "A"] }), null);
  assert.equal(core.restoreGame({ ...review, introSeen: false }), null);
  assert.equal(core.restoreGame({ ...review, drawProgress: { bag: [], seen: null } }), null);
  assert.equal(core.restoreGame({ ...review, drawProgress: { bag: [], seen: ["a-fruit", "a-fruit"] } }), null);
});

test("older saved games keep playing without reusing their original prompts", () => {
  const old = core.createGame({ unavailableLetters: ["N", "V", "W", "O"] });
  delete old.unavailableLetters;
  delete old.introSeen;
  old.turnNumber = 1;
  old.drawProgress = { bag: [], lastId: "a-fruit" };
  const restored = core.restoreGame(old);
  assert.equal(restored.introSeen, true);
  assert.deepEqual(restored.unavailableLetters, []);
  assert.ok(restored.drawProgress.seen.includes("a-fruit"));
});
