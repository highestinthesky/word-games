import test from "node:test";
import assert from "node:assert/strict";
import { CARDS } from "../cards.js";
import { boot, savedGame } from "./harness.mjs";

async function setMode(app, enabled) {
  app.click("settingsButton");
  app.get("neanderthalsInput").checked = enabled;
  app.saveSettings();
}

test("Setup enables and persists the separate no-forbidden-words mode", async () => {
  const app = await boot(savedGame());
  await setMode(app, true);
  assert.equal(app.saved().neanderthals, true);
  assert.equal(app.saved().teams[0].score, 3);
  app.click("startRoundButton");
  assert.equal(app.get("forbiddenBlock").hidden, true);
  assert.equal(app.get("forbiddenWords").children.length, 0);
  assert.match(app.saved().usedCardIds[0], /^neanderthals:/);
  assert.match(app.get("tabooButton").textContent, /Rule break/);
});

test("canceling Setup discards the mode draft", async () => {
  const app = await boot(savedGame());
  app.click("settingsButton");
  app.get("neanderthalsInput").checked = true;
  app.get("settingsDialog").close();
  app.click("settingsButton");
  assert.equal(app.get("neanderthalsInput").checked, false);
});

test("legacy and invalid saved modes still draw standard Taboo cards", async () => {
  for (const neanderthals of [undefined, false, "true", 1, {}]) {
    const app = await boot(savedGame({ neanderthals }));
    app.click("startRoundButton");
    assert.equal(app.saved().neanderthals, false);
    assert.equal(app.get("forbiddenBlock").hidden, false);
    assert.equal(app.get("forbiddenWords").children.length, 5);
    assert.ok(CARDS.some((card) => card.target === app.get("cardWord").textContent));
  }
});

test("reload retains mode and filters invalid history without dropping either deck", async () => {
  const app = await boot(savedGame({ neanderthals: true }));
  app.click("startRoundButton");
  const first = app.saved().usedCardIds[0];
  const reloaded = await boot({ ...app.saved(), usedCardIds: [first, first, "pizza", "bogus"] });
  reloaded.click("startRoundButton");
  assert.equal(reloaded.get("forbiddenBlock").hidden, true);
  assert.ok(reloaded.saved().usedCardIds.includes(first));
  assert.ok(reloaded.saved().usedCardIds.includes("pizza"));
  assert.equal(reloaded.saved().usedCardIds.length, 3);
});

test("a running or paused round cannot change its mode", async () => {
  const app = await boot(savedGame());
  app.click("startRoundButton");
  app.click("settingsButton");
  assert.equal(app.get("neanderthalsInput").disabled, true);
  app.get("neanderthalsInput").checked = true;
  app.saveSettings();
  assert.equal(app.saved().neanderthals, false);
  assert.equal(app.get("forbiddenWords").children.length, 5);
});

test("mode changes retain scores and independent used-card histories", async () => {
  const app = await boot(savedGame());
  app.click("startRoundButton");
  const standardId = app.saved().usedCardIds[0];
  app.advanceTime(60_001);
  app.click("closeSummaryButton");
  await setMode(app, true);
  app.click("startRoundButton");
  const poetryId = app.saved().usedCardIds.at(-1);
  assert.match(poetryId, /^neanderthals:/);
  app.advanceTime(60_001);
  app.click("closeSummaryButton");
  await setMode(app, false);
  app.click("startRoundButton");
  assert.equal(app.get("forbiddenBlock").hidden, false);
  assert.equal(app.get("forbiddenWords").children.length, 5);
  assert.ok(app.saved().usedCardIds.includes(poetryId));
  assert.notEqual(app.saved().usedCardIds.at(-1), standardId);
  assert.equal(app.saved().teams[0].score, 3);
});

test("one-syllable violations score minus one and new game retains the mode", async () => {
  const app = await boot(savedGame({ neanderthals: true, skipPenalty: true }));
  app.click("startRoundButton");
  app.click("correctButton");
  app.advanceTime(100);
  app.click("tabooButton");
  app.advanceTime(100);
  app.click("skipButton");
  app.advanceTime(60_001);
  assert.equal(app.saved().teams[0].score, 2);
  assert.equal(app.get("summaryScore").textContent, "-1");
  assert.equal(app.get("summaryTaboo").textContent, "1");
  app.click("closeSummaryButton");
  app.click("resetGameButton");
  assert.equal(app.saved().neanderthals, true);
  assert.deepEqual(app.saved().usedCardIds, []);
  assert.equal(app.saved().teams[0].score, 0);
});

test("the original challenge deck has unique categorized targets and no forbidden words", async () => {
  const { NEANDERTHAL_CARDS: cards } = await import("../neanderthal-cards.js");
  assert.ok(cards.length >= 180);
  assert.equal(new Set(cards.map((card) => card.target.toLowerCase())).size, cards.length);
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
  assert.ok(new Set(cards.map((card) => card.category)).size >= 6);
  for (const card of cards) {
    assert.match(card.id, /^neanderthals:/);
    assert.ok(card.target.length > 0 && card.target.length <= 32);
    assert.ok(card.category);
    assert.deepEqual(card.forbidden, []);
    assert.ok(!CARDS.some((standard) => standard.id === card.id));
  }
  for (const target of ["Confirmation Bias", "Natural Selection", "Civil Disobedience", "Opportunity Cost"]) {
    assert.ok(cards.some((card) => card.target === target), target);
  }
});

test("an exhausted challenge deck stays exhausted after reload and does not affect standard Taboo", async () => {
  const { NEANDERTHAL_CARDS: cards } = await import("../neanderthal-cards.js");
  const app = await boot(savedGame({ neanderthals: true, usedCardIds: cards.map((card) => card.id) }));
  app.click("startRoundButton");
  assert.equal(app.get("correctButton").disabled, true);
  assert.match(app.get("toastRegion").children[0].textContent, /Every card/);
  await setMode(app, false);
  app.click("startRoundButton");
  assert.equal(app.get("forbiddenWords").children.length, 5);
});
