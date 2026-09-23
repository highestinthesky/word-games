import { CARD_GROUPS } from "./reviewed-cards.js?v=20260922-3";

// A card is written for its own target. The first three forbidden words block
// a direct description; the final two block another likely clue route.
export function isPlayableWord(value) {
  return typeof value === "string" && /^[a-z]+$/i.test(value);
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

export function buildCards(groups = CARD_GROUPS) {
  const seen = new Set();
  const cards = [];

  for (const [category, entries] of groups) {
    if (!category || !Array.isArray(entries)) throw new Error("Every card group needs a category and entries.");

    for (const [target, direct, association] of entries) {
      const key = target.toLowerCase();
      const clues = [...direct, ...association];
      const clueKeys = clues.map((word) => word.toLowerCase());

      if (!isPlayableWord(target) || direct.length !== 3 || association.length !== 2
        || !clues.every(isPlayableWord) || new Set(clueKeys).size !== 5
        || clueKeys.includes(key) || seen.has(key)) {
        throw new Error(`Invalid reviewed card: ${target}`);
      }

      seen.add(key);
      cards.push({
        id: key,
        target,
        forbidden: clues.map(capitalize),
        category
      });
    }
  }

  return cards;
}

export const CARDS = Object.freeze(buildCards().map((card) => Object.freeze({
  ...card,
  forbidden: Object.freeze(card.forbidden)
})));
export const CARD_COUNT = CARDS.length;
