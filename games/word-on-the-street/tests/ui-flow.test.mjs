import test from "node:test";
import assert from "node:assert/strict";
import { acknowledgeIntro, createGame, expireTurn, insertLetter, startTurn, submitWord, challengeWord } from "../game-core.js";
import { boot } from "./harness.mjs";

const category = { id: "a-pet", family: "animals", prompt: "A pet" };
const base = (options = {}) => acknowledgeIntro(createGame({ names: ["North", "South"], unavailableLetters: ["N", "V", "W", "Y"], ...options }));
const labelSlots = (html) => (html.match(/prompt-bar__label/g) ?? []).length;

async function withApp(game, run) {
  const view = await boot(game);
  try { await run(view); } finally { view.restore(); }
}

test("the prompt bar reserves its label line in every phase so its height never changes", async () => {
  const running = startTurn(base(), category);
  const reviewed = submitWord(insertLetter(insertLetter(running, "A"), "T"));
  const phases = {
    welcome: createGame({ removedCount: 0 }),
    "ready, no label": { ...expireTurn(running), turnNumber: 3 },
    composing: running,
    review: reviewed,
    challenge: challengeWord(reviewed),
    won: { ...reviewed, phase: "won", winner: 0 }
  };
  for (const [name, game] of Object.entries(phases)) {
    await withApp(game, ({ app }) => {
      assert.equal(labelSlots(app.innerHTML), 1, name);
      assert.match(app.innerHTML, /<h1>/, name);
    });
  }
  await withApp({ ...expireTurn(running), turnNumber: 3 }, ({ app }) => {
    assert.match(app.innerHTML, /<span class="mono-label prompt-bar__label"[^>]*><\/span><h1>South next<\/h1>/);
  });
  await withApp(running, ({ app }) => {
    assert.match(app.innerHTML, /<span class="mono-label prompt-bar__label"><span class="prompt-bar__team">North<\/span><\/span><h1>A pet<\/h1>/);
  });
});

test("setup offers 0 to 4 removed letters and preselects the current setting", async () => {
  await withApp(base({ unavailableLetters: undefined, removedCount: 2, random: () => 0.5 }), ({ dialogs, action }) => {
    action("open-setup");
    const html = dialogs.setup.innerHTML;
    assert.match(html, /Letters removed/);
    assert.deepEqual([...html.matchAll(/<option value="(\d)"/g)].map((match) => match[1]), ["0", "1", "2", "3", "4"]);
    assert.match(html, /<option value="2" selected>/);
    assert.equal((html.match(/ selected>/g) ?? []).length, 2, "one selected option for the clock, one for removed letters");
  });
});

test("a setup submit removes the chosen number of letters and never reuses the last game's", async () => {
  for (const removed of [0, 1, 3, 4]) {
    await withApp(base(), ({ dialogs, saved, submitSetup }) => {
      const before = saved().unavailableLetters;
      submitSetup({ team0: "North", team1: "South", timer: "30", removed: String(removed) });
      const next = saved();
      assert.equal(next.removedCount, removed);
      assert.equal(next.unavailableLetters.length, removed);
      assert.ok(next.unavailableLetters.every((letter) => !before.includes(letter)), `removed ${removed}`);
      assert.equal(dialogs.setup.closed, 1);
      assert.equal(dialogs.intro.opened, removed === 0 ? 0 : 1, `announcement for ${removed}`);
      assert.equal((dialogs.intro.innerHTML.match(/class="intro-letter"/g) ?? []).length, removed);
    });
  }
});

test("new game and play again keep the removal setting and draw all-new letters", async () => {
  for (const action of ["confirm-reset", "play-again"]) {
    await withApp(base({ unavailableLetters: ["B", "C"] }), ({ saved, action: act }) => {
      act(action);
      const next = saved();
      assert.equal(next.removedCount, 2, action);
      assert.equal(next.unavailableLetters.length, 2);
      assert.ok(next.unavailableLetters.every((letter) => !["B", "C"].includes(letter)), action);
      assert.equal(next.turnNumber, 0);
      assert.equal(next.overtimeSeen, false);
    });
  }
});

test("a 2× pull popup appears once, when turn seven resolves, before the next category", async () => {
  const waiting = { ...expireTurn(startTurn(base(), category)), turnNumber: 7 };
  await withApp(waiting, ({ dialogs, saved, app, action }) => {
    assert.equal(dialogs.overtime.opened, 1);
    assert.equal(dialogs.intro.opened, 0);
    assert.match(dialogs.overtime.innerHTML, /2×/);
    assert.match(dialogs.overtime.innerHTML, /Overtime/);
    assert.match(dialogs.overtime.innerHTML, /data-action="acknowledge-overtime"/);
    assert.doesNotMatch(app.innerHTML, /2× pull/);
    action("acknowledge-overtime");
    assert.equal(dialogs.overtime.closed, 1);
    assert.equal(saved().overtimeSeen, true);
    assert.equal(dialogs.overtime.opened, 1);
  });
  await withApp({ ...waiting, overtimeSeen: true }, ({ dialogs }) => assert.equal(dialogs.overtime.opened, 0));
  await withApp({ ...waiting, turnNumber: 6 }, ({ dialogs }) => assert.equal(dialogs.overtime.opened, 0));
  await withApp({ ...startTurn(base(), category), turnNumber: 7 }, ({ dialogs }) => assert.equal(dialogs.overtime.opened, 0));
});

test("passing the seventh turn raises the popup, and the eighth turn shows the 2× pull label", async () => {
  const seventh = { ...startTurn(base(), category), turnNumber: 7 };
  await withApp(seventh, ({ dialogs, action }) => {
    assert.equal(dialogs.overtime.opened, 0);
    action("pass-turn");
    assert.equal(dialogs.overtime.opened, 1);
  });
  const eighth = { ...startTurn(base(), category), turnNumber: 8, overtimeSeen: true };
  await withApp(eighth, ({ app, dialogs }) => {
    assert.match(app.innerHTML, /<span class="prompt-bar__team">North<\/span><span class="prompt-bar__pull">· 2× pull<\/span><\/span><h1>A pet<\/h1>/);
    assert.equal(dialogs.overtime.opened, 0);
  });
});
