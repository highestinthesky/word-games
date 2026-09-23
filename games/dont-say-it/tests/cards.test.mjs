import test from "node:test";
import assert from "node:assert/strict";
import { buildCards, CARDS, CARD_COUNT, isPlayableWord } from "../cards.js";
import { CARD_GROUPS } from "../reviewed-cards.js";

test("the reviewed deck has hundreds of unique, familiar targets", () => {
  assert.ok(CARD_COUNT >= 646, `expected at least twice the original 323 cards, found ${CARD_COUNT}`);
  const targets = CARDS.map((card) => card.target.toLowerCase());
  assert.equal(new Set(targets).size, CARD_COUNT);
  assert.deepEqual(
    ["pizza", "hospital", "dog", "computer", "hammer", "avocado", "flamingo", "thermostat"].every((target) => targets.includes(target)),
    true
  );
  for (const obscure of ["euphonium", "caecilian", "makemake", "perigee", "mouflon"]) {
    assert.ok(!targets.includes(obscure), `${obscure} should not be in the deck`);
  }
});

test("every target has two distinct clue approaches and five strong forbidden words", () => {
  const sourceTargets = [];
  for (const [category, entries] of CARD_GROUPS) {
    assert.ok(category);
    assert.ok(entries.length >= 15, `${category} needs a substantial set`);
    for (const [target, direct, association] of entries) {
      sourceTargets.push(target.toLowerCase());
      assert.ok(isPlayableWord(target), `unfamiliar target: ${target}`);
      assert.equal(direct.length, 3, `${target} needs three direct clues`);
      assert.equal(association.length, 2, `${target} needs two association clues`);
      const clues = [...direct, ...association].map((word) => word.toLowerCase());
      assert.ok(clues.every(isPlayableWord), `${target} has an awkward forbidden word`);
      assert.equal(new Set(clues).size, 5, `${target} repeats a forbidden word`);
      assert.ok(!clues.includes(target.toLowerCase()), `${target} forbids itself`);
    }
  }
  assert.equal(new Set(sourceTargets).size, sourceTargets.length);
  assert.equal(sourceTargets.length, CARD_COUNT);
  for (const card of CARDS) {
    assert.equal(card.forbidden.length, 5);
    assert.ok(card.category);
  }
});

test("common targets block their most likely descriptions and associations", () => {
  const cards = new Map(CARDS.map((card) => [card.target, card.forbidden]));
  assert.deepEqual(cards.get("Pizza"), ["Cheese", "Crust", "Pepperoni", "Slice", "Delivery"]);
  assert.deepEqual(cards.get("Hospital"), ["Doctor", "Nurse", "Patient", "Emergency", "Surgery"]);
  assert.deepEqual(cards.get("Dog"), ["Bark", "Puppy", "Pet", "Leash", "Fetch"]);
  assert.deepEqual(cards.get("Hammer"), ["Head", "Handle", "Pound", "Nails", "Carpenter"]);
  assert.deepEqual(cards.get("Avocado"), ["Green", "Pit", "Creamy", "Toast", "Guacamole"]);
});

test("invalid or duplicate target-specific cards cannot enter the deck", () => {
  assert.throws(
    () => buildCards([["Food", [
      ["Pizza", ["cheese", "crust", "pepperoni"], ["slice", "delivery"]],
      ["Pizza", ["cheese", "crust", "pepperoni"], ["slice", "delivery"]]
    ]]]),
    /Invalid reviewed card/
  );
});
