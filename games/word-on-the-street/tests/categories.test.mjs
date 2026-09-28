import test from "node:test";
import assert from "node:assert/strict";

const { CATEGORIES, drawCategory } = await import("../categories.js");

test("category deck has distinct, concise, school-suitable prompts", () => {
  assert.ok(CATEGORIES.length >= 120);
  assert.equal(new Set(CATEGORIES.map((item) => item.id)).size, CATEGORIES.length);
  assert.ok(CATEGORIES.every((item) => item.prompt.length <= 48 && item.prompt.length > 4));
});

test("categories do not repeat within a game, even after the bag is exhausted", () => {
  let progress = {};
  const seen = new Set();
  for (let index = 0; index < CATEGORIES.length; index += 1) {
    const draw = drawCategory(progress, () => 0.5);
    assert.ok(!seen.has(draw.category.id));
    seen.add(draw.category.id);
    progress = draw.progress;
  }
  assert.equal(seen.size, CATEGORIES.length);
  const exhausted = drawCategory(progress, () => 0.5);
  assert.equal(exhausted.category, null);
  assert.deepEqual(exhausted.progress.seen.sort(), [...seen].sort());
  assert.equal(drawCategory({}, () => 0.5).category !== null, true);
});
