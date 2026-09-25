import { GAMES } from "./games/registry.js?v=20260924-5";

const entries = [...document.querySelectorAll("[data-game-id]")];
const gamesById = new Map(GAMES.map((game) => [game.id, game]));
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
