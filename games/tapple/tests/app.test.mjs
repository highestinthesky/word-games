import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import * as core from "../game-core.js";
import * as categories from "../categories.js";

async function boot(saved) {
  const nodes = new Map();
  const listeners = new Map();
  const get = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML: "", open: false, addEventListener() {},
      showModal() { this.open = true; }, close() { this.open = false; }
    });
    return nodes.get(selector);
  };
  let stored = JSON.stringify(saved);
  const context = vm.createContext({
    ...core, ...categories,
    document: {
      querySelector: get,
      addEventListener(name, listener) { listeners.set(name, listener); }
    },
    window: { clearInterval() {}, setInterval() {}, clearTimeout() {}, setTimeout() {} },
    requestAnimationFrame(fn) { fn(); },
    localStorage: {
      getItem: () => stored,
      setItem(_key, value) { stored = value; },
      removeItem() { stored = null; }
    }
  });
  const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
  vm.runInContext(source.replace(/^import[\s\S]*?from\s+"[^"]+";\n/gm, ""), context);
  return {
    html: () => get("#app").innerHTML,
    saved: () => JSON.parse(stored),
    click(action) {
      const target = { dataset: { action }, closest() { return this; } };
      listeners.get("click")({ target });
    }
  };
}

test("reloading a legacy third-overtime prompt restores the current phase without another draw", async () => {
  for (const overtime of [2, 3]) {
    const saved = core.startRound(core.createGame({ names: ["Maya", "Sam", "Elena"] }), categories.CLASSROOM_SAFE_PACK.categories[0]);
    Object.assign(saved.round, {
      overtime, status: "overtime", answersRequired: 2, turnSeconds: 20,
      remainingSeconds: 1, usedLetters: ["A", "B"], turnsTaken: 8
    });
    const app = await boot(saved);
    assert.match(app.html(), /data-action="resume-turn"/);
    assert.doesNotMatch(app.html(), /data-action="draw-overtime"/);
    app.click("resume-turn");
    const resumed = app.saved();
    assert.equal(resumed.round.status, "running");
    assert.equal(resumed.round.overtime, overtime);
    assert.equal(resumed.round.category.id, saved.round.category.id);
    assert.deepEqual(resumed.round.usedLetters, ["A", "B"]);
    assert.equal(resumed.round.remainingSeconds, 20);
  }
});
