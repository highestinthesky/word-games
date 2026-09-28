import { CATEGORIES, LEGACY_CATEGORY_IDS } from "./categories.js";

export const STREET_LETTERS = Object.freeze("BCDFGHKLMNPRSTVWY".split(""));
export const OTHER_LETTERS = Object.freeze("AEIOUJQXZ".split(""));
const ALPHABET = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
const VOWELS = Object.freeze("AEIOU".split(""));
const PHASES = new Set(["ready", "composing", "review", "challenge", "won"]);

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function copy(game) {
  return structuredClone(game);
}

function endTurn(game, nextTeam) {
  game.phase = "ready";
  game.nextTeam = nextTeam;
  game.word = [];
  game.category = null;
  game.reviewSnapshot = null;
  game.remainingSeconds = game.timerSeconds;
  return game;
}

function finishAccepted(game, nextTeam) {
  const winner = [0, 1].find((index) => scoreFor(game, index) >= 8);
  if (winner !== undefined) {
    game.phase = "won";
    game.winner = winner;
    game.reviewSnapshot = null;
    return game;
  }
  return endTurn(game, nextTeam);
}

function validUnavailable(letters, count = 4) {
  return Array.isArray(letters) && letters.length === count && new Set(letters).size === count
    && letters.every((letter) => STREET_LETTERS.includes(letter));
}

function oldUnavailable(letters) {
  return Array.isArray(letters) && letters.length === 4 && new Set(letters).size === 4
    && letters.filter((letter) => STREET_LETTERS.includes(letter)).length === 3
    && letters.filter((letter) => VOWELS.includes(letter)).length === 1;
}

export function pickUnavailableLetters(random = Math.random, previous = []) {
  const consonants = [...STREET_LETTERS];
  const chosen = [];
  for (let index = 0; index < 4; index += 1) {
    chosen.push(consonants.splice(Math.floor(random() * consonants.length), 1)[0]);
  }
  if (chosen.length === previous.length && chosen.every((letter) => previous.includes(letter))) {
    chosen[0] = consonants[0];
  }
  return chosen.sort();
}

export function createGame({ names = ["Team A", "Team B"], timerSeconds = 30, unavailableLetters, previousUnavailableLetters = [], random = Math.random } = {}) {
  ensure(Array.isArray(names) && names.length === 2, "Name two teams.");
  const cleaned = names.map((name) => String(name).trim());
  ensure(cleaned.every(Boolean), "Name both teams.");
  ensure(cleaned[0].toLocaleLowerCase() !== cleaned[1].toLocaleLowerCase(), "Team names must differ.");
  ensure(Number.isInteger(timerSeconds) && timerSeconds >= 10 && timerSeconds <= 120, "Choose a clock from 10 to 120 seconds.");
  const unavailable = unavailableLetters ?? pickUnavailableLetters(random, previousUnavailableLetters);
  ensure(validUnavailable(unavailable), "Choose four street consonants to exclude.");
  return {
    version: 1,
    teams: cleaned,
    timerSeconds,
    remainingSeconds: timerSeconds,
    positions: Object.fromEntries(STREET_LETTERS.map((letter) => [letter, 0])),
    unavailableLetters: [...unavailable].sort(),
    introSeen: false,
    phase: "ready",
    activeTeam: 0,
    nextTeam: 0,
    category: null,
    word: [],
    reviewSnapshot: null,
    winner: null,
    turnNumber: 0,
    endsAt: null,
    drawProgress: { bag: [], seen: [], lastId: null }
  };
}

export function acknowledgeIntro(game) {
  ensure(game.phase === "ready" && game.turnNumber === 0, "Announce letters before the first turn.");
  const next = copy(game);
  next.introSeen = true;
  return next;
}

export function startTurn(game, category, now = Date.now()) {
  ensure(game.phase === "ready", "Finish the current turn first.");
  ensure(game.introSeen, "Announce the unavailable letters first.");
  ensure(category?.id && category?.prompt, "Draw a category.");
  const next = copy(game);
  next.phase = "composing";
  next.activeTeam = next.nextTeam;
  next.category = category;
  next.word = [];
  next.remainingSeconds = next.timerSeconds;
  next.endsAt = now + next.timerSeconds * 1000;
  next.turnNumber += 1;
  return next;
}

export function insertLetter(game, letter, index = game.word.length) {
  ensure(game.phase === "composing", "Letters are available during a running turn.");
  const value = String(letter).toUpperCase();
  ensure(ALPHABET.has(value), "Choose a letter A–Z.");
  ensure(!game.unavailableLetters.includes(value), "That letter is unavailable this game.");
  ensure(Number.isInteger(index) && index >= 0 && index <= game.word.length, "Choose a word position.");
  const next = copy(game);
  next.word.splice(index, 0, value);
  return next;
}

export function removeLetter(game, index) {
  ensure(game.phase === "composing", "Edit the word during a running turn.");
  ensure(Number.isInteger(index) && index >= 0 && index < game.word.length, "Choose a word letter.");
  const next = copy(game);
  next.word.splice(index, 1);
  return next;
}

export function moveLetter(game, from, to) {
  ensure(game.phase === "composing", "Edit the word during a running turn.");
  ensure(Number.isInteger(from) && from >= 0 && from < game.word.length, "Choose a word letter.");
  ensure(Number.isInteger(to) && to >= 0 && to < game.word.length, "Choose a word position.");
  const next = copy(game);
  const [letter] = next.word.splice(from, 1);
  next.word.splice(to, 0, letter);
  return next;
}

export function expireTurn(game) {
  ensure(game.phase === "composing", "Only a running turn can expire.");
  const next = copy(game);
  next.endsAt = null;
  return endTurn(next, 1 - next.activeTeam);
}

export function displayPositions(game) {
  if (game.phase !== "composing") return game.positions;
  const positions = { ...game.positions };
  const direction = game.activeTeam === 0 ? 1 : -1;
  const strength = game.turnNumber > 7 ? 2 : 1;
  for (const letter of game.word) {
    const position = positions[letter];
    if (position === undefined || Math.abs(position) === 3) continue;
    positions[letter] = Math.max(-3, Math.min(3, position + direction * strength));
  }
  return positions;
}

export function submitWord(game) {
  ensure(game.phase === "composing", "Submit during a running turn.");
  ensure(game.word.length >= 2, "Build a word before submitting.");
  const next = copy(game);
  next.reviewSnapshot = { ...next.positions };
  next.positions = displayPositions(next);
  next.phase = "review";
  next.endsAt = null;
  return next;
}

export function acceptWord(game) {
  ensure(game.phase === "review", "Review the submitted word first.");
  return finishAccepted(copy(game), 1 - game.activeTeam);
}

export function challengeWord(game) {
  ensure(game.phase === "review", "Challenge a submitted word.");
  const next = copy(game);
  next.phase = "challenge";
  return next;
}

export function resolveChallenge(game, verdict) {
  ensure(game.phase === "challenge", "Start a challenge first.");
  ensure(["stands", "rejected"].includes(verdict), "Choose a challenge verdict.");
  const next = copy(game);
  if (verdict === "stands") return finishAccepted(next, 1 - next.activeTeam);
  next.positions = { ...next.reviewSnapshot };
  return endTurn(next, 1 - next.activeTeam);
}

export function scoreFor(game, team) {
  ensure(team === 0 || team === 1, "Choose a team.");
  const capturedPosition = team === 0 ? 3 : -3;
  return STREET_LETTERS.filter((letter) => game.positions[letter] === capturedPosition).length;
}

export function viewRow(position, activeTeam) {
  ensure(Number.isInteger(position) && position >= -3 && position <= 3, "Choose a street position.");
  ensure(activeTeam === 0 || activeTeam === 1, "Choose a team.");
  return 4 + position * (activeTeam === 0 ? 1 : -1);
}

export function restoreGame(value) {
  if (!value || value.version !== 1 || !PHASES.has(value.phase)) return null;
  const legacy = value.unavailableLetters === undefined;
  const savedUnavailable = legacy ? [] : value.unavailableLetters;
  const unavailable = oldUnavailable(savedUnavailable)
    ? savedUnavailable.filter((letter) => STREET_LETTERS.includes(letter)) : savedUnavailable;
  if (!validUnavailable(unavailable, 4) && !validUnavailable(unavailable, 3) && !validUnavailable(unavailable, 0)) return null;
  if (legacy && !Array.isArray(value.drawProgress?.seen)) {
    value.drawProgress = { ...value.drawProgress, seen: value.turnNumber > 0 ? [...LEGACY_CATEGORY_IDS] : [] };
  }
  value.unavailableLetters = unavailable;
  value.introSeen = legacy ? true : value.introSeen;
  if (typeof value.introSeen !== "boolean") return null;
  if (!value.introSeen && (value.phase !== "ready" || value.turnNumber !== 0)) return null;
  if (!Array.isArray(value.teams) || value.teams.length !== 2 || value.teams.some((name) => typeof name !== "string" || !name.trim())) return null;
  if (!Number.isInteger(value.timerSeconds) || value.timerSeconds < 10 || value.timerSeconds > 120) return null;
  if (![0, 1].includes(value.activeTeam) || ![0, 1].includes(value.nextTeam)) return null;
  if (!Array.isArray(value.word) || value.word.some((letter) => !ALPHABET.has(letter) || unavailable.includes(letter))) return null;
  if (!value.positions || STREET_LETTERS.some((letter) => !Number.isInteger(value.positions[letter]) || Math.abs(value.positions[letter]) > 3)) return null;
  if (unavailable.some((letter) => STREET_LETTERS.includes(letter) && value.positions[letter] !== 0)) return null;
  if (["composing", "review", "challenge"].includes(value.phase) && (typeof value.category?.id !== "string" || typeof value.category?.prompt !== "string" || !value.category.prompt)) return null;
  if (value.phase === "composing" && !Number.isFinite(value.endsAt)) return null;
  if (["review", "challenge"].includes(value.phase) && (!value.reviewSnapshot || STREET_LETTERS.some((letter) => !Number.isInteger(value.reviewSnapshot[letter]) || Math.abs(value.reviewSnapshot[letter]) > 3))) return null;
  if (value.phase === "won" && (![0, 1].includes(value.winner) || scoreFor(value, value.winner) < 8)) return null;
  if (!value.drawProgress || !Array.isArray(value.drawProgress.bag) || !Array.isArray(value.drawProgress.seen)) return null;
  const known = new Set(CATEGORIES.map((item) => item.id));
  if (value.drawProgress.seen.some((id) => !known.has(id)) || new Set(value.drawProgress.seen).size !== value.drawProgress.seen.length) return null;
  return value;
}
