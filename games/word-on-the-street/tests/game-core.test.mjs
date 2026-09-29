import test from "node:test";
import assert from "node:assert/strict";

const core = await import("../game-core.js");
const category = { id: "instruments", prompt: "A musical instrument" };

function running() {
  return core.startTurn(core.acknowledgeIntro(core.createGame({ names: ["North", "South"], unavailableLetters: ["N", "V", "W", "Y"] })), category);
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

test("the street previews each selected letter without committing its position", () => {
  const start = running();
  const one = core.insertLetter(start, "T");
  assert.equal(core.displayPositions(one).T, 1);
  assert.equal(one.positions.T, 0);
  const two = core.insertLetter(one, "T");
  assert.equal(core.displayPositions(two).T, 2);
  const three = core.insertLetter(two, "T");
  assert.equal(core.displayPositions(three).T, 3);
  assert.equal(core.scoreFor({ ...three, positions: core.displayPositions(three) }, 0), 1);
  assert.equal(core.displayPositions(core.removeLetter(two, 1)).T, 1);
  assert.equal(core.displayPositions(core.expireTurn(two)).T, 0);
  assert.equal(core.submitWord(two).positions.T, 2);
});

test("the preview respects captured letters and the active team's direction", () => {
  const first = core.acceptWord(core.submitWord(word(running(), "MISSISSIPPI")));
  const second = core.startTurn(first, category);
  const selected = word(second, "SASS");
  assert.equal(core.displayPositions(selected).S, 3);
  assert.equal(core.displayPositions(selected).A, undefined);
  assert.equal(core.displayPositions(selected).M, 1);
  assert.equal(core.displayPositions(core.insertLetter(selected, "M")).M, 0);
});

test("pull strength doubles after seven completed team turns", () => {
  const seventh = { ...running(), turnNumber: 7 };
  const eighth = { ...running(), turnNumber: 8 };
  assert.equal(core.displayPositions(core.insertLetter(seventh, "T")).T, 1);
  assert.equal(core.displayPositions(core.insertLetter(eighth, "T")).T, 2);
  assert.equal(core.displayPositions(word(eighth, "TT")).T, 3);
  assert.equal(core.submitWord(word(eighth, "TA")).positions.T, 2);
  assert.equal(core.displayPositions(core.insertLetter({ ...eighth, activeTeam: 1 }, "T")).T, -2);
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

test("each new game excludes four consonants while every vowel stays usable", () => {
  const unavailable = core.pickUnavailableLetters(() => 0);
  assert.equal(unavailable.length, 4);
  assert.equal(new Set(unavailable).size, 4);
  assert.ok(unavailable.every((letter) => core.STREET_LETTERS.includes(letter)));
  const first = core.createGame({ random: () => 0 });
  const second = core.createGame({ random: () => 0, previousUnavailableLetters: first.unavailableLetters });
  assert.notDeepEqual(second.unavailableLetters, first.unavailableLetters);
  const game = core.createGame({ unavailableLetters: ["N", "V", "W", "Y"] });
  assert.equal(game.introSeen, false);
  assert.throws(() => core.startTurn(game, category), /letters/i);
  const ready = core.acknowledgeIntro(game);
  assert.equal(ready.introSeen, true);
  const turn = core.startTurn(ready, category);
  assert.throws(() => core.insertLetter(turn, "N"), /unavailable/i);
  assert.equal(word(turn, "AEIOU").word.join(""), "AEIOU");
});

test("saved games with a blocked vowel regain it without losing progress", () => {
  const saved = { ...running(), unavailableLetters: ["N", "V", "W", "O"] };
  const restored = core.restoreGame(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(restored.unavailableLetters, ["N", "V", "W"]);
  assert.equal(restored.turnNumber, saved.turnNumber);
  assert.equal(core.insertLetter(restored, "O").word.join(""), "O");
  assert.deepEqual(core.restoreGame(JSON.parse(JSON.stringify(restored))).unavailableLetters, ["N", "V", "W"]);
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
  const old = core.createGame({ unavailableLetters: ["N", "V", "W", "Y"] });
  delete old.unavailableLetters;
  delete old.introSeen;
  old.turnNumber = 1;
  old.drawProgress = { bag: [], lastId: "a-fruit" };
  const restored = core.restoreGame(old);
  assert.equal(restored.introSeen, true);
  assert.deepEqual(restored.unavailableLetters, []);
  assert.ok(restored.drawProgress.seen.includes("a-fruit"));
});

test("setup chooses how many consonants each new game removes, from 0 to 4", () => {
  for (const count of [0, 1, 2, 3, 4]) {
    const game = core.createGame({ removedCount: count, random: () => 0.3 });
    assert.equal(game.removedCount, count);
    assert.equal(game.unavailableLetters.length, count);
    assert.ok(game.unavailableLetters.every((letter) => core.STREET_LETTERS.includes(letter)));
    assert.equal(game.introSeen, count === 0);
  }
  assert.equal(core.createGame().removedCount, 4);
  for (const bad of [5, -1, 2.5, "3"]) {
    assert.throws(() => core.createGame({ removedCount: bad }), /0 to 4/, String(bad));
  }
});

test("a game with nothing removed starts its first turn without an announcement", () => {
  const game = core.createGame({ removedCount: 0 });
  assert.equal(core.startTurn(game, category).phase, "composing");
  assert.equal(core.insertLetter(core.startTurn(game, category), "T").word.join(""), "T");
});

test("a new game never removes a consonant the previous game removed", () => {
  let state = 7;
  const random = () => { state = (state * 48271) % 2147483647; return state / 2147483647; };
  let previous = [];
  for (let round = 0; round < 300; round += 1) {
    const removedCount = round % 5;
    const next = core.createGame({ removedCount, previousUnavailableLetters: previous, random });
    assert.ok(next.unavailableLetters.every((letter) => !previous.includes(letter)), `round ${round}`);
    assert.equal(next.unavailableLetters.length, removedCount);
    previous = next.unavailableLetters;
  }
  const first = core.pickUnavailableLetters(() => 0);
  const second = core.pickUnavailableLetters(() => 0, first);
  assert.ok(second.every((letter) => !first.includes(letter)));
});

test("the 2× pull notice is due once, when turn seven resolves", () => {
  let game = core.acknowledgeIntro(core.createGame({ unavailableLetters: ["N", "V", "W", "Y"] }));
  assert.equal(game.overtimeSeen, false);
  for (let turn = 1; turn <= 7; turn += 1) {
    assert.equal(core.needsOvertimeNotice(game), false, `before turn ${turn}`);
    game = core.expireTurn(core.startTurn(game, category));
  }
  assert.equal(game.turnNumber, 7);
  assert.equal(core.overtimeActive(game), false);
  assert.equal(core.needsOvertimeNotice(game), true);
  assert.equal(core.needsOvertimeNotice({ ...game, phase: "won" }), false);
  const seen = core.acknowledgeOvertime(game);
  assert.equal(seen.overtimeSeen, true);
  assert.equal(core.needsOvertimeNotice(seen), false);
  const eighth = core.startTurn(seen, category);
  assert.equal(core.overtimeActive(eighth), true);
  assert.equal(core.needsOvertimeNotice(eighth), false);
  assert.equal(core.needsOvertimeNotice(core.expireTurn(eighth)), false);
  assert.equal(core.createGame().overtimeSeen, false);
});

test("saved games keep the removal setting and never repeat the overtime notice", () => {
  const none = core.createGame({ removedCount: 0 });
  assert.deepEqual(core.restoreGame(JSON.parse(JSON.stringify(none))), none);
  const two = core.createGame({ removedCount: 2, random: () => 0.5 });
  assert.equal(core.restoreGame(JSON.parse(JSON.stringify(two))).removedCount, 2);

  const old = JSON.parse(JSON.stringify({ ...running(), turnNumber: 8 }));
  delete old.removedCount;
  delete old.overtimeSeen;
  const restored = core.restoreGame(old);
  assert.equal(restored.removedCount, 4);
  assert.equal(restored.overtimeSeen, true);

  const waiting = JSON.parse(JSON.stringify({ ...core.expireTurn(running()), turnNumber: 7 }));
  delete waiting.overtimeSeen;
  assert.equal(core.needsOvertimeNotice(core.restoreGame(waiting)), true);

  const five = JSON.parse(JSON.stringify(running()));
  five.unavailableLetters = ["B", "C", "D", "F", "G"];
  assert.equal(core.restoreGame(five), null);
  assert.equal(core.restoreGame({ ...JSON.parse(JSON.stringify(running())), removedCount: 9 })?.removedCount, 4);
});
