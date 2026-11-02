import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { CARDS } from "../cards.js";
import * as core from "../game-core.js";

// Only browser boundaries are replaced; every action runs the real app.
function element(tagName = "div") {
  const listeners = new Map();
  const classes = new Set();
  return {
    tagName, children: [], dataset: {}, attributes: {}, textContent: "", value: "",
    checked: false, disabled: false, hidden: false, open: false,
    style: { setProperty() {} },
    classList: {
      add: (name) => classes.add(name), remove: (name) => classes.delete(name),
      toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }
    },
    addEventListener(name, fn) { listeners.set(name, fn); },
    emit(name, event = {}) { listeners.get(name)?.({ currentTarget: this, preventDefault() {}, ...event }); },
    setAttribute(name, value) { this.attributes[name] = value; },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    querySelectorAll(selector) {
      const descendants = this.children.flatMap((child) => [child, ...child.querySelectorAll(selector)]);
      return descendants.filter((child) => selector === "input" && child.tagName === "input");
    },
    querySelector() { return this.querySelectorAll("input").at(-1) ?? element("input"); },
    showModal() { this.open = true; },
    close() { this.open = false; this.emit("close"); },
    remove() {}, focus() {}, select() {}
  };
}

export async function boot(saved) {
  const nodes = new Map();
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, element());
    return nodes.get(id);
  };
  let value = saved === undefined ? null : JSON.stringify(saved);
  let now = 0;
  let sequence = 0;
  const frames = new Map();
  const timeouts = new Map();
  const browserWindow = {
    requestAnimationFrame(fn) { frames.set(++sequence, fn); return sequence; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(fn, ms) { timeouts.set(++sequence, { fn, at: now + ms }); return sequence; },
    clearTimeout(id) { timeouts.delete(id); }
  };
  const document = {
    querySelector: (selector) => selector === "dialog[open]" ? [...nodes.values()].find((node) => node.open) : get(selector.slice(1)),
    createElement: element, addEventListener() {}, fullscreenElement: null
  };
  let neanderthalCards = [];
  try { neanderthalCards = (await import("../neanderthal-cards.js")).NEANDERTHAL_CARDS; }
  catch (error) { if (error.code !== "ERR_MODULE_NOT_FOUND") throw error; }
  const context = vm.createContext({
    ...core, CARDS, NEANDERTHAL_CARDS: neanderthalCards, document, window: browserWindow,
    requestAnimationFrame: browserWindow.requestAnimationFrame,
    Date: class extends Date { static now() { return now; } },
    localStorage: { getItem: () => value, setItem: (_key, next) => { value = next; } },
    FormData: class { get() { return "60"; } }
  });
  const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
  vm.runInContext(source.replace(/^import[\s\S]*?from\s+"[^"]+";\n/gm, ""), context);
  return {
    get, saved: () => JSON.parse(value), click: (id) => get(id).emit("click"),
    saveSettings: () => get("settingsForm").emit("submit"),
    advanceTime(ms) {
      now += ms;
      for (const [id, timeout] of timeouts) {
        if (timeout.at <= now) { timeouts.delete(id); timeout.fn(); }
      }
      const currentFrames = [...frames.values()];
      frames.clear();
      currentFrames.forEach((fn) => fn());
    }
  };
}

export function savedGame(overrides = {}) {
  return {
    teams: [{ id: "sun", name: "Team Sun", score: 3 }, { id: "sky", name: "Team Sky", score: 1 }],
    activeTeamIndex: 0, duration: 60, skipPenalty: false, roundNumber: 0, usedCardIds: [],
    ...overrides
  };
}
