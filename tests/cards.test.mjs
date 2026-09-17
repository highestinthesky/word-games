import test from "node:test";
import assert from "node:assert/strict";
import { CARDS, CARD_COUNT, WORD_CLUSTERS } from "../cards.js";

test("the deck contains at least 1,000 unique target cards", () => {
  assert.ok(CARD_COUNT >= 1000, `expected at least 1,000 cards, found ${CARD_COUNT}`);
  const targets = CARDS.map((card) => card.target.toLocaleLowerCase());
  assert.equal(new Set(targets).size, CARD_COUNT);
});

test("every card has five distinct and relevant cluster words", () => {
  for (const card of CARDS) {
    assert.equal(card.forbidden.length, 5, `${card.target} does not have five forbidden words`);
    const normalized = card.forbidden.map((word) => word.toLocaleLowerCase());
    assert.equal(new Set(normalized).size, 5, `${card.target} repeats a forbidden word`);
    assert.ok(!normalized.includes(card.target.toLocaleLowerCase()), `${card.target} forbids itself`);
    assert.ok(card.category.length > 0, `${card.target} is missing a category`);
  }
});

test("source clusters stay six terms wide", () => {
  for (const [category, words] of WORD_CLUSTERS) {
    assert.ok(category, "cluster is missing a category");
    assert.equal(words.length, 6, `${category} cluster must contain six terms`);
    assert.equal(new Set(words.map((word) => word.toLocaleLowerCase())).size, 6);
  }
});
