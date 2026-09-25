import test from "node:test";
import assert from "node:assert/strict";
import { CLASSROOM_SAFE_PACK, drawCategory, upgradeDrawBag } from "../categories.js";

const excludedThemes = /dating|body|alcohol|drug|smoking|gambling|weapon|violence|death|crime|war|trauma|religion|race|ethnicity|nationality|gender|disability|health|politic|money|family|discipline|insult|slur/i;

test("classroom-safe categories cover distinct, familiar topics with reviewed answers", () => {
  const ids = CLASSROOM_SAFE_PACK.categories.map((category) => category.id);
  const prompts = CLASSROOM_SAFE_PACK.categories.map((category) => category.prompt);
  const families = CLASSROOM_SAFE_PACK.categories.map((category) => category.family);

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(prompts).size, prompts.length);
  assert.ok(CLASSROOM_SAFE_PACK.categories.length >= 108);
  assert.ok(new Set(families).size >= 6);
  assert.ok(prompts.includes("Breakfast foods"));
  assert.ok(prompts.includes("Kitchen tools"));
  assert.ok(prompts.includes("Things on a taco"));
  assert.ok(prompts.includes("Things in a magic show"));
  assert.ok(!prompts.includes("Things that are green"));
  assert.ok(!prompts.includes("Things you can put in a box"));

  for (const category of CLASSROOM_SAFE_PACK.categories) {
    assert.ok(category.minAnswers >= 8, category.id + " needs eight plausible answers");
    assert.match(category.difficulty, /^(easy|medium)$/);
    assert.doesNotMatch(category.prompt, excludedThemes);
    assert.ok(category.exampleAnswers.length >= 8, category.id + " needs reviewed examples");
    assert.ok(new Set(category.exampleAnswers.map((answer) => answer[0].toUpperCase())).size >= 6, category.id + " needs varied starting letters");
  }
});

test("category draws avoid the last two topic families when possible", () => {
  const categories = [
    { id: "food", family: "food" },
    { id: "objects", family: "objects" },
    { id: "nature", family: "nature" }
  ];
  const first = drawCategory({ categories, drawBag: ["food", "objects", "nature"], recentFamilies: ["food"] });
  assert.equal(first.category.id, "objects");
  assert.deepEqual(first.recentFamilies, ["food", "objects"]);

  const second = drawCategory({ categories, drawBag: first.drawBag, recentFamilies: first.recentFamilies });
  assert.equal(second.category.id, "nature");
  const third = drawCategory({ categories, drawBag: second.drawBag, recentFamilies: second.recentFamilies });
  assert.equal(third.category.id, "food");
});

test("a saved draw bag gains new categories without losing its pending order", () => {
  const categories = [
    { id: "old-a", introduced: 1 },
    { id: "old-b", introduced: 1 },
    { id: "new-a", introduced: 2 },
    { id: "new-b", introduced: 2 }
  ];
  const upgraded = upgradeDrawBag(categories, ["old-b"], 1, () => 0);
  assert.deepEqual(new Set(upgraded), new Set(["new-a", "new-b", "old-b"]));
  assert.equal(upgraded.at(-1), "old-b");
  assert.deepEqual(upgradeDrawBag(categories, ["old-b"], 2), ["old-b"]);
});

test("no two categories share most of their reviewed answers", () => {
  const categories = CLASSROOM_SAFE_PACK.categories;
  for (let first = 0; first < categories.length; first += 1) {
    const answers = new Set(categories[first].exampleAnswers.map((answer) => answer.toLocaleLowerCase()));
    for (let second = first + 1; second < categories.length; second += 1) {
      const overlap = categories[second].exampleAnswers.filter((answer) => answers.has(answer.toLocaleLowerCase()));
      assert.ok(overlap.length <= 3, `${categories[first].prompt} / ${categories[second].prompt}: ${overlap.join(", ")}`);
    }
  }
});
