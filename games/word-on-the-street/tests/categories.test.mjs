import test from "node:test";
import assert from "node:assert/strict";

const { CATEGORIES, drawCategory } = await import("../categories.js");
const core = await import("../game-core.js");

function seeded(seed) {
  let state = seed;
  return () => { state = (state * 48271) % 2147483647; return state / 2147483647; };
}

test("category deck is large, distinct, short, and quick to answer", () => {
  assert.ok(CATEGORIES.length >= 280, `only ${CATEGORIES.length} prompts`);
  assert.equal(new Set(CATEGORIES.map((item) => item.id)).size, CATEGORIES.length);
  assert.ok(CATEGORIES.every((item) => item.prompt.length <= 32 && item.prompt.length > 4));
  const cores = CATEGORIES.map((item) => item.prompt.toLowerCase().replace(/^(a|an|something)\s+/, ""));
  assert.equal(new Set(cores).size, cores.length, "two prompts differ only by their opening word");
  const families = new Set(CATEGORIES.map((item) => item.family));
  assert.ok(families.size >= 12, `only ${families.size} families`);
  assert.ok(CATEGORIES.every((item) => item.family && item.prompt === item.prompt.trim()));
});

test("prompts that need specialist knowledge stay out of the deck", () => {
  const prompts = new Set(CATEGORIES.map((item) => item.prompt.toLowerCase()));
  for (const hard of ["a chemical element", "a cell structure", "a literary device", "a fossil", "a mathematical symbol",
    "a camera part", "a poem form", "a physics term", "a chemistry term", "a constellation", "a mineral", "a stage role"]) {
    assert.ok(!prompts.has(hard), hard);
  }
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

test("consecutive draws never share a family while other families remain", () => {
  for (const seed of [1, 7, 42, 2024]) {
    const random = seeded(seed);
    let progress = {};
    let previous = null;
    for (let index = 0; index < CATEGORIES.length - 25; index += 1) {
      const draw = drawCategory(progress, random);
      assert.notEqual(draw.category.family, previous, `seed ${seed}, draw ${index}`);
      previous = draw.category.family;
      progress = draw.progress;
    }
  }
});

test("a saved game survives the deck changing under it", () => {
  const game = core.createGame({ removedCount: 0 });
  const saved = JSON.parse(JSON.stringify(game));
  saved.drawProgress = { bag: ["retired-prompt"], seen: ["retired-prompt", CATEGORIES[0].id], lastId: "retired-prompt" };
  const restored = core.restoreGame(saved);
  assert.deepEqual(restored.drawProgress.seen, [CATEGORIES[0].id]);
  assert.equal(drawCategory(restored.drawProgress, () => 0.5).category !== null, true);
});
