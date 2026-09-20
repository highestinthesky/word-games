# Category Sprint — shared-screen game brief

**Status:** playable implementation complete. The game is available at `games/tapple/` and remains isolated from the other games.

## Product decision

We will make a Tapple-style category game for one classroom smartboard, with a working title of **Category Sprint**. The play experience keeps the compelling mechanic—rapid category recall under a shrinking bank of starting letters—while the website uses original visual design, original category sets, and a rectangular letter bank rather than recreating the branded physical wheel. "Tapple" is used here to identify the inspiration, not as the public product name.

The site is for a friend group standing around one shared display. There are no player accounts, phone joins, QR codes, or individual-device turns. One person operates the board as the host/timekeeper; players give their answers aloud.

## Research summary

### The original game loop

The official rules describe a 2–8 player game for ages 8 and up. A round starts from a category. Within ten seconds, a player says an acceptable answer beginning with an unused letter, presses that letter, resets the timer, and passes the turn. A player is out after time expires, an answer is rejected by the group, or an unavailable letter is used. The last player remaining wins the category card; the standard target is three cards. If more than one player remains after all letters are used, overtime starts on a new category, requiring two answers with different letters in the same ten seconds; a later overtime requires three. [Official rulebook](https://content.cmpl.org/bg/Tapple.pdf) · [current publisher overview](https://theop.games/products/tapple-fast-word-fun-for-the-whole-family)

The current publisher product describes 144 categories on 36 cards. Those supplied topics, rules text, brand assets, and physical wheel design will not be copied into this site. [Publisher product page](https://theop.games/products/tapple-fast-word-fun-for-the-whole-family)

### Current digital approaches

A current third-party mobile listing offers classic, extreme, four-category, and solo variants. This is useful evidence that the core mechanic supports several modes, but it is not a content source or a visual reference for this project. [Tapple: Word Game listing](https://play.google.com/store/apps/details?id=com.imagineapps.tapple)

Some current party-game services use a TV/host display plus QR-connected personal devices. That model is intentionally rejected here because students cannot use phones at school. [RallyDeck](https://rallydeck.net/)

## Website design

### Game selector

The root page is a small game shelf, not a marketing landing page. It shows every game in a consistent catalogue card:

- **Don’t Say It** is playable and links into its isolated folder.
- **Category Sprint** is playable and links into its isolated folder.
- The page states the shared-screen promise plainly: local games, one display, no personal devices.

The visual direction is warm paper, restrained coral accents, black-brown ink, a bold sans display, and clear touch targets. It deliberately avoids childlike illustration, gradients, generic game icons, fabricated play statistics, and copied board-game imagery.

### Category Sprint game flow

1. **Setup** — Host chooses 2–8 player names, a card target (default: 3), and a timer. Ten seconds is the standard mode; 15 seconds is an accessibility option for the classroom.
2. **Choose a category** — The host draws an original, reviewed category from the selected topic pack. The default pack is Classroom Safe.
3. **Start a turn** — The active player is named prominently. A large timer begins only when the host taps Start.
4. **Speak, mark, reset** — The player says an answer aloud. The host taps that answer’s starting letter in the on-screen letter bank, then hits the large Reset & Pass control. The app does not require typing an answer during the ten-second window.
5. **Challenge fairly** — If an answer is disputed, the host pauses the timer and the group decides. The application records no automatic correctness judgment; this avoids false rejections of legitimate names, dialect terms, and culturally specific answers.
6. **Eliminate or continue** — A timeout or rejected answer marks the player out for that round. The app advances the active turn only among remaining players.
7. **Resolve the round** — The last remaining player earns the category card. The next round starts fresh with a new category and a restored letter bank.
8. **Overtime** — When the configured letter bank is exhausted with multiple players still in, the app resets the bank, draws a new category, and raises the per-turn answer requirement from one to two; each further overtime adds one answer.
9. **Finish** — The first player to reach the selected card target wins. The summary gives the host Start another round and Return to shelf actions.

## Smartboard interaction requirements

- Use a full-bleed game surface with a clear, persistent active-player name, category, timer, and available-letter bank.
- Make every touch target at least 64 CSS pixels tall or wide; the central timer/reset control should be substantially larger.
- Keep all time-critical controls in the lower half of the board where a standing operator can reach them easily.
- Provide keyboard equivalents for laptop-connected boards: Space starts or pauses; letter keys mark letters; Enter resets and passes; `P` pauses for a challenge.
- Include a native full-screen control and preserve the game’s single-screen state through a refresh using local storage.
- Use colour plus state labels and shape changes for available, used, active, paused, and eliminated conditions. Never use colour alone.
- Support reduced motion and a high-contrast-friendly palette. Timer urgency must remain readable at a distance without flashing effects.

## Content safety policy

The default topic pack must be safe for a school friend group. It should use broad, answerable categories such as foods, animals, books, weather, hobbies, objects, places, science, and everyday activities. It must not depend on a particular student’s personal life, appearance, identity, or background.

The default pack excludes categories centered on:

- sexual content, dating, bodies, or body image;
- alcohol, drugs, smoking, gambling, or weapons;
- violence, death, crime, war, self-harm, or trauma;
- religion, race, ethnicity, nationality, immigration status, gender identity, disability, health, or mental health;
- politics, current events, legal trouble, money, family status, or school discipline;
- insults, stereotypes, slurs, ranking people, or any prompt that singles out a student.

Each category will be written and reviewed before it becomes playable. The curation checklist is:

1. It is understandable without a brand, celebrity, or inside joke.
2. It has at least eight plausible answers across the playable letter bank.
3. It does not reward personal disclosure or exclusion.
4. It can be judged by a group without looking up private information.
5. It has a clear difficulty label and belongs to the correct topic pack.

Hosts will always be able to skip a category without penalty. Future custom packs must start as local drafts and require explicit review before being shown on the classroom-safe selector.

## Implemented scope

The Category Sprint folder contains these isolated implementation files:

```text
games/tapple/
  index.html                 # Game entry page
  app.js                     # Shared-screen state machine and controls
  styles.css                 # Game-only styles and responsive smartboard layout
  tokens.css                 # Game-only visual tokens
  categories.js              # Original reviewed topic packs and metadata
  game-core.js               # Pure round, letter-bank, overtime, and scoring rules
  tests/                     # Unit tests for core rules and category constraints
```

The game will publish one `game.js` manifest for the selector. The only cross-game change should be adding that manifest to `games/registry.js`; Don’t Say It remains untouched.

## Definition of done for the playable game

- A host can complete a full 2–8 player, first-to-three-card game on one shared display.
- Standard play, timeout elimination, challenges, card scoring, and escalating overtime are covered by automated tests.
- No original publisher branding, text, topic cards, or wheel artwork appears in the implementation.
- The Classroom Safe pack passes the curation checklist and can be skipped at any time.
- The interface works with both touch and keyboard, full-screen mode, 320–768 px layouts, and a large classroom display.
