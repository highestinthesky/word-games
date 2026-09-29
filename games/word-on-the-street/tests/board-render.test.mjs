import test from "node:test";
import assert from "node:assert/strict";
import { acknowledgeIntro, createGame, startTurn } from "../game-core.js";

const category = { id: "instruments", prompt: "A musical instrument" };

function streetRow(html, letter) {
  const tile = html.match(new RegExp(`style="--column:\\d+;--row:(\\d+)" data-letter="${letter}"`));
  return tile ? Number(tile[1]) : null;
}

test("selecting and removing letters redraws the street immediately, while unavailable letters are absent", async () => {
  const game = startTurn(acknowledgeIntro(createGame({
    names: ["North", "South"], unavailableLetters: ["N", "V", "W", "Y"]
  })), category);
  game.turnNumber = 8;
  const app = { innerHTML: "", contains: () => false, querySelector: () => null, querySelectorAll: () => [] };
  const dialog = () => ({ open: false, addEventListener() {} });
  const elements = new Map([
    ["#app", app], ["#live-region", { textContent: "" }],
    ["#setup-dialog", dialog()], ["#reset-dialog", dialog()],
    ["#rules-dialog", dialog()], ["#intro-dialog", dialog()], ["#overtime-dialog", dialog()]
  ]);
  const handlers = new Map();
  const previous = {
    document: globalThis.document, window: globalThis.window,
    localStorage: globalThis.localStorage, setInterval: globalThis.setInterval
  };
  try {
    globalThis.document = {
      querySelector: (selector) => elements.get(selector),
      addEventListener: (name, handler) => handlers.set(name, handler),
      activeElement: null, fullscreenElement: null
    };
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    globalThis.localStorage = { getItem: () => JSON.stringify(game), setItem() {} };
    globalThis.setInterval = () => 0;
    await import("../app.js");

    assert.equal(streetRow(app.innerHTML, "T"), 4);
    assert.equal(streetRow(app.innerHTML, "N"), null);
    assert.match(app.innerHTML, /data-source-letter="O"/);
    assert.match(app.innerHTML, /--street-count:13/);
    assert.match(app.innerHTML, /2× pull/);
    const columns = [...app.innerHTML.matchAll(/style="--column:(\d+);--row:\d+" data-letter="[A-Z]"/g)].map((match) => Number(match[1]));
    assert.deepEqual(columns, Array.from({ length: 13 }, (_, index) => index + 1));

    const click = (selector, dataset) => handlers.get("click")({
      target: { closest: (query) => query === selector ? { dataset } : null }
    });
    click("[data-source-letter]", { sourceLetter: "T" });
    assert.equal(streetRow(app.innerHTML, "T"), 6);
    click("[data-source-letter]", { sourceLetter: "T" });
    assert.equal(streetRow(app.innerHTML, "T"), 7);
    assert.match(app.innerHTML, /<strong>North<\/strong><span>1 \/ 8<\/span>/);
    click("[data-word-index]", { wordIndex: "1" });
    assert.equal(streetRow(app.innerHTML, "T"), 6);
    assert.match(app.innerHTML, /<strong>North<\/strong><span>0 \/ 8<\/span>/);
  } finally {
    Object.assign(globalThis, previous);
  }
});
