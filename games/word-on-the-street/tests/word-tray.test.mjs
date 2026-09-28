import test from "node:test";
import assert from "node:assert/strict";

const { insertionIndex } = await import("../word-tray.js");

test("drag hover inserts before or after the nearest letter", () => {
  const tiles = [
    { left: 100, right: 150, top: 300, bottom: 350 },
    { left: 158, right: 208, top: 300, bottom: 350 },
    { left: 216, right: 266, top: 300, bottom: 350 }
  ];
  assert.equal(insertionIndex(tiles, 110, 325), 0);
  assert.equal(insertionIndex(tiles, 153, 325), 1);
  assert.equal(insertionIndex(tiles, 280, 325), 3);
});

test("drag hover finds insertion point in a wrapped word", () => {
  const tiles = [
    { left: 100, right: 150, top: 300, bottom: 350 },
    { left: 158, right: 208, top: 300, bottom: 350 },
    { left: 100, right: 150, top: 358, bottom: 408 }
  ];
  assert.equal(insertionIndex(tiles, 110, 380), 2);
  assert.equal(insertionIndex(tiles, 180, 380), 3);
});
