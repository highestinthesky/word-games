import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GAMES } from "../games/registry.js";

test("the game shelf has unique game identifiers and clear availability", () => {
  assert.ok(GAMES.length >= 2);
  assert.equal(new Set(GAMES.map((game) => game.id)).size, GAMES.length);

  for (const game of GAMES) {
    assert.ok(game.title);
    assert.ok(game.description);
    assert.ok(["ready", "planning"].includes(game.status));
    assert.ok(Array.isArray(game.facts));
    assert.ok(game.facts.length >= 2);
    assert.ok(Array.isArray(game.loop));
    assert.equal(game.loop.length, 3);
  }

  const readyGame = GAMES.find((game) => game.status === "ready");
  assert.ok(readyGame?.href);
  assert.ok(readyGame?.actionLabel);
});

test("the published selector has usable static links before JavaScript loads", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  for (const game of GAMES.filter((item) => item.status === "ready")) {
    assert.match(html, new RegExp(`data-game-id=["']${game.id}["']`));
    assert.match(html, new RegExp(`href=["']${game.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
  }
});
