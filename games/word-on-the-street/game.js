export const game = Object.freeze({
  id: "word-on-the-street",
  title: "Word on the Street",
  description: "Build a category word, then pull its consonants toward your team.",
  status: "ready",
  format: "street-word",
  href: "./games/word-on-the-street/",
  actionLabel: "Play Word on the Street",
  facts: Object.freeze(["2 teams", "30–60 sec turns", "4 letters out"]),
  loop: Object.freeze(["Build a word", "Review", "Pull letters"])
});
