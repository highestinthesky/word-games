import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

function rule(selector) {
  const start = css.indexOf(`\n${selector} {`);
  assert.ok(start >= 0, `${selector} rule exists`);
  return css.slice(start, css.indexOf("\n}", start));
}

function topLevelTokens(value) {
  const tokens = [];
  let depth = 0;
  let current = "";
  for (const character of value.trim()) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === " " && depth === 0) { tokens.push(current); current = ""; } else current += character;
  }
  return [...tokens, current];
}

test("the street reserves matching gutters on both sides so its letter line stays centred", () => {
  const columns = rule(".street-board").match(/grid-template-columns:\s*([^;]+);/)[1];
  const tokens = topLevelTokens(columns);
  assert.equal(tokens.length, 3);
  assert.equal(tokens[0], tokens[2]);
  assert.match(tokens[1], /^repeat\(var\(--street-count\)/);
});

test("the prompt bar holds one height whether or not a label or category is showing", () => {
  assert.match(rule(".prompt-bar__label"), /display:\s*flex/);
  assert.match(rule(".prompt-bar__label"), /white-space:\s*nowrap/);
  assert.match(rule(".prompt-bar__label"), /min-block-size:\s*1lh/);
  assert.match(rule(".prompt-bar__team"), /text-overflow:\s*ellipsis/);
  assert.match(rule(".prompt-bar__pull"), /flex:\s*none/);
  const heading = rule(".prompt-bar h1");
  assert.match(heading, /white-space:\s*nowrap/);
  assert.match(heading, /text-overflow:\s*ellipsis/);
  assert.match(css, /@media \(max-width: 38rem\) \{[^@]*\.prompt-bar h1 \{[^}]*min-block-size:\s*2lh/);
  assert.match(css, /@media \(max-width: 38rem\) \{[^@]*\.prompt-bar h1 \{[^}]*-webkit-line-clamp:\s*2/);
});

test("the overtime tile is styled from shared tokens only", () => {
  const tile = rule(".overtime-tile");
  assert.doesNotMatch(tile, /#[0-9a-f]{3,8}\b|oklch\(|rgb\(/i);
  assert.match(tile, /background:\s*var\(--color-accent\)/);
});
