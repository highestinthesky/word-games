import test from "node:test";
import assert from "node:assert/strict";
import { acknowledgeIntro, createGame, startTurn } from "../game-core.js";
import { loadGame, saveGame } from "../storage.js";

test("game stays playable when browser storage is blocked", () => {
  const blocked = () => { throw new Error("storage blocked"); };
  const fresh = loadGame(blocked);
  assert.equal(fresh.phase, "ready");
  assert.equal(fresh.timerSeconds, 30);
  assert.equal(saveGame(fresh, blocked), false);
});

test("saved game resumes, and an elapsed clock passes the turn", () => {
  const saved = startTurn(acknowledgeIntro(createGame()), { id: "fruit", prompt: "A fruit" }, 1000);
  const storage = {
    value: null,
    getItem() { return this.value; },
    setItem(_key, value) { this.value = value; }
  };
  assert.equal(saveGame(saved, () => storage), true);
  assert.equal(loadGame(() => storage, 2000).phase, "composing");
  const expired = loadGame(() => storage, 32000);
  assert.equal(expired.phase, "ready");
  assert.equal(expired.nextTeam, 1);
});
