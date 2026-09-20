import { GAMES } from "./games/registry.js";

const entries = [...document.querySelectorAll("[data-game-id]")];
const gamesById = new Map(GAMES.map((game) => [game.id, game]));
const gameCount = document.querySelector("#game-count");

if (gameCount) {
  const readyCount = GAMES.filter((game) => game.status === "ready").length;
  gameCount.textContent = `${readyCount} ${readyCount === 1 ? "game" : "games"} · no sign-in`;
}

for (const entry of entries) {
  const game = gamesById.get(entry.dataset.gameId);
  if (!game || game.status !== "ready") continue;

  entry.href = game.href;
  entry.setAttribute("aria-label", `Open ${game.title}`);

  entry.addEventListener("click", () => {
    entry.dataset.state = "loading";
    const actionCopy = entry.querySelector(".game-entry__action-copy");
    if (actionCopy) actionCopy.textContent = "Opening…";
  });
}

window.addEventListener("pageshow", () => {
  for (const entry of entries) {
    delete entry.dataset.state;
    const actionCopy = entry.querySelector(".game-entry__action-copy");
    if (actionCopy) actionCopy.textContent = "Open game";
  }
});
