# Taboo

The local-first clue game has 683 familiar targets. Each card forbids five likely clues drawn from two ways someone might describe the target. Cards are reviewed individually in `reviewed-cards.js` and `additional-reviewed-cards.js`.

Open this game from the root selector or at `games/dont-say-it/` while the local server is running.

Enable **Neanderthals mode** in Setup for Poetry for Neanderthals: describe targets using only one-syllable words, without saying the target or its parts. There is no forbidden-word list. The separate deck has 180 original concepts and phrases for educated high school students, covering reasoning, science, society, economics, language, and technology. These are original prompts, not a copy of the commercial deck.

Use **Rule break −1** (or `T` / `←`) when a clue breaks the rule; players judge the spoken clues. The timer, teams, correct-answer scoring, and optional skip penalty work as in standard Taboo.

Change mode between rounds. Saving a mode change preserves scores and both decks' used-card histories, including after a reload. New game clears scores and both histories while keeping the chosen mode, teams, and settings.
