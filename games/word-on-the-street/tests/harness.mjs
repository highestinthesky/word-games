// A minimal fake DOM that boots the real app.js against a given saved game.
let boots = 0;

function fakeDialog() {
  const dialog = {
    open: false, innerHTML: "", opened: 0, closed: 0, listeners: {},
    addEventListener(name, handler) { dialog.listeners[name] = handler; },
    showModal() { dialog.open = true; dialog.opened += 1; },
    close() { dialog.open = false; dialog.closed += 1; },
    querySelector: () => ({ textContent: "" })
  };
  return dialog;
}

export async function boot(game) {
  const app = { innerHTML: "", contains: () => false, querySelector: () => null, querySelectorAll: () => [] };
  const dialogs = { setup: fakeDialog(), reset: fakeDialog(), rules: fakeDialog(), intro: fakeDialog(), overtime: fakeDialog() };
  const elements = new Map([
    ["#app", app], ["#live-region", { textContent: "" }], ["#setup-dialog", dialogs.setup],
    ["#reset-dialog", dialogs.reset], ["#rules-dialog", dialogs.rules],
    ["#intro-dialog", dialogs.intro], ["#overtime-dialog", dialogs.overtime]
  ]);
  const handlers = new Map();
  const storage = { value: JSON.stringify(game) };
  const previous = {
    document: globalThis.document, window: globalThis.window, localStorage: globalThis.localStorage,
    setInterval: globalThis.setInterval, requestAnimationFrame: globalThis.requestAnimationFrame,
    FormData: globalThis.FormData
  };
  globalThis.document = {
    querySelector: (selector) => elements.get(selector),
    addEventListener: (name, handler) => handlers.set(name, handler),
    activeElement: null, fullscreenElement: null
  };
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  globalThis.localStorage = { getItem: () => storage.value, setItem: (_key, value) => { storage.value = value; } };
  globalThis.setInterval = () => 0;
  globalThis.requestAnimationFrame = (callback) => callback();
  globalThis.FormData = class { constructor(form) { this.fields = form.fields; } get(name) { return this.fields[name]; } };
  boots += 1;
  await import(`../app.js?boot=${boots}`);
  const click = (matches) => {
    handlers.get("click")({ target: { closest: (query) => (matches[query] ? { dataset: matches[query] } : null) } });
  };
  return {
    app, dialogs, storage, click,
    saved: () => JSON.parse(storage.value),
    action: (name) => click({ "[data-action]": { action: name } }),
    submitSetup: (fields) => dialogs.setup.listeners.submit({ preventDefault() {}, target: { fields } }),
    restore() { Object.assign(globalThis, previous); }
  };
}
