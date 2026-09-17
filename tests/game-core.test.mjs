import test from "node:test";
import assert from "node:assert/strict";
import {
  areTeamNamesValid,
  formatSignedScore,
  normalizeTeamName,
  scoreRound,
  shuffle
} from "../game-core.js";

test("round scoring applies correct, taboo, and optional skip points", () => {
  const stats = { correct: 7, skipped: 2, taboo: 1 };
  assert.equal(scoreRound(stats, false), 6);
  assert.equal(scoreRound(stats, true), 4);
});

test("team names are normalized and must be unique", () => {
  assert.equal(normalizeTeamName("  Team   North  "), "Team North");
  assert.equal(areTeamNamesValid(["North", "South"]), true);
  assert.equal(areTeamNamesValid(["North", " north "]), false);
  assert.equal(areTeamNamesValid(["Only one"]), false);
});

test("signed score formatting is compact", () => {
  assert.equal(formatSignedScore(4), "+4");
  assert.equal(formatSignedScore(0), "0");
  assert.equal(formatSignedScore(-2), "-2");
});

test("shuffle returns a new array without losing entries", () => {
  const source = [1, 2, 3, 4];
  const result = shuffle(source, () => 0.25);
  assert.notEqual(result, source);
  assert.deepEqual([...result].sort(), source);
  assert.deepEqual(source, [1, 2, 3, 4]);
});
