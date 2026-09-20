import test from "node:test";
import assert from "node:assert/strict";
import { CLASSROOM_SAFE_PACK } from "../categories.js";

const excludedThemes = /dating|body|alcohol|drug|smoking|gambling|weapon|violence|death|crime|war|trauma|religion|race|ethnicity|nationality|gender|disability|health|politic|money|family|discipline|insult|slur/i;

test("classroom-safe categories are uniquely named, reviewed, and broad enough", () => {
  const ids = CLASSROOM_SAFE_PACK.categories.map((category) => category.id);
  const prompts = CLASSROOM_SAFE_PACK.categories.map((category) => category.prompt);

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(prompts).size, prompts.length);
  assert.ok(CLASSROOM_SAFE_PACK.categories.length >= 30);

  for (const category of CLASSROOM_SAFE_PACK.categories) {
    assert.ok(category.minAnswers >= 8, category.id + " needs eight plausible answers");
    assert.match(category.difficulty, /^(easy|medium)$/);
    assert.doesNotMatch(category.prompt, excludedThemes);
  }
});
