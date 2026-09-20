import test from "node:test";
import assert from "node:assert/strict";
import { buildCards, CARDS, CARD_COUNT, isPlayableWord, WORD_CLUSTERS } from "../cards.js";
import { EXPANDED_WORD_CLUSTERS } from "../expanded-word-clusters.js";

test("the deck contains at least 2,400 unique target cards", () => {
  assert.ok(CARD_COUNT >= 2400, `expected at least 2,400 cards, found ${CARD_COUNT}`);
  const targets = CARDS.map((card) => card.target.toLocaleLowerCase());
  assert.equal(new Set(targets).size, CARD_COUNT);
});

test("the 300-set expansion provides a large playable word bank", () => {
  const expansionCards = buildCards(EXPANDED_WORD_CLUSTERS);
  assert.equal(EXPANDED_WORD_CLUSTERS.length, 300);
  assert.ok(expansionCards.length >= 1300, `expected 1,300 expansion cards, found ${expansionCards.length}`);
});

test("every card has five distinct and relevant cluster words", () => {
  for (const card of CARDS) {
    assert.equal(card.forbidden.length, 5, `${card.target} does not have five forbidden words`);
    const normalized = card.forbidden.map((word) => word.toLocaleLowerCase());
    assert.equal(new Set(normalized).size, 5, `${card.target} repeats a forbidden word`);
    assert.ok(!normalized.includes(card.target.toLocaleLowerCase()), `${card.target} forbids itself`);
    assert.ok(card.category.length > 0, `${card.target} is missing a category`);
    assert.ok(isPlayableWord(card.target), `${card.target} is not a familiar one-word target`);
    assert.ok(card.forbidden.every(isPlayableWord), `${card.target} has a non-playable forbidden word`);
  }
});

test("source clusters stay six terms wide", () => {
  for (const [category, words] of WORD_CLUSTERS) {
    assert.ok(category, "cluster is missing a category");
    assert.equal(words.length, 6, `${category} cluster must contain six terms`);
    assert.equal(new Set(words.map((word) => word.toLocaleLowerCase())).size, 6);
  }
});
