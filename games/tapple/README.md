# Tapple

Shared-screen category game for a classroom smartboard. The original product brief lives in [../../docs/tapple-website-brief.md](../../docs/tapple-website-brief.md).

It includes its own entry page, local game state, 108 reviewed categories, gameplay styles, and focused unit tests. It does not need player accounts or personal devices.

Each category has reviewed sample answers. Draws avoid the previous two topic families when possible, and the category order continues across new games in the same browser.

The starting player rotates each round. After the first two rounds, each eligible round has a 12% chance of a modifier; modifiers never appear on consecutive rounds:

- **Double answers:** two different answers and starting letters per turn, with twice the base time.
- **Open letter:** a marked common letter can be taken again with a different spoken answer. A turn cap prevents the phase from running indefinitely.
- **Category swap:** after every original player has taken one turn, the prompt changes; claimed letters remain used. Skipping this phase draws two replacement prompts.
- **Speed laps:** each completed lap removes two seconds from the turn clock, up to four seconds total. The clock never falls below six seconds.

If few ordinary letters remain for the players still in, overtime draws a new category and restores the bank. Overtime always asks for two answers per turn with twice the base time. A skipped category restarts the current phase with the same starting player.
