export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function scoreRound(stats, skipPenalty = false) {
  return stats.correct - stats.taboo - (skipPenalty ? stats.skipped : 0);
}

export function normalizeTeamName(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 24);
}

export function areTeamNamesValid(names) {
  const normalized = names.map(normalizeTeamName);
  const unique = new Set(normalized.map((name) => name.toLocaleLowerCase()));
  return normalized.length >= 2 && normalized.every(Boolean) && unique.size === normalized.length;
}

export function formatSignedScore(value) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

export function makeId(prefix = "team") {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
