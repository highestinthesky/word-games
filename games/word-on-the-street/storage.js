import { createGame, expireTurn, restoreGame } from "./game-core.js";

const STORAGE_KEY = "word-games:word-on-the-street:v1";

export function loadGame(storageProvider = () => globalThis.localStorage, now = Date.now()) {
  try {
    const saved = restoreGame(JSON.parse(storageProvider().getItem(STORAGE_KEY)));
    if (saved) return saved.phase === "composing" && saved.endsAt <= now ? expireTurn(saved) : saved;
  } catch {
    // The game remains usable when storage is blocked or the saved value is invalid.
  }
  return createGame();
}

export function saveGame(game, storageProvider = () => globalThis.localStorage) {
  try {
    storageProvider().setItem(STORAGE_KEY, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}
