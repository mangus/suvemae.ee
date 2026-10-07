# Bot Game Studio

A game about making a game with an AI helper.

You and your robot helper mintbot build a little game together. Tap an idea card ("Add a hero", "Add a monster", "Add a big boss"…) and mintbot writes the code, using up a few ⚡ credits. Every idea you build makes the next one cost 1 ⚡ more, but each published idea makes your ⚡ tank 3 bigger. There are 41 ideas to unlock. Players also pay you 💰 cash. Spend it in the shop on upgrades: a bigger credit tank, faster credits, more robot arms (build several ideas at once) and faster building. Sometimes a bug 🐛 sneaks in: tap it in the game picture to squash it. Press **Publish** to send your game live. Published fun brings players, but bugs that went live chase them away. Get 5000 happy players as fast as you can and put your time on the high score table.

- Played on a phone with taps, or on a computer with the mouse.
- Uses the lab high score table (`addScore`, `topScores` with `order: 'asc'`) and keeps your personal best in `localStorage`.

Idea by the ⚡ Uku group. Made with the help of the Suvemäe labor [AI agent on mintbot.ai](https://mintbot.ai/). All drawings and sounds are made in code; no outside material.

The shop has 9 upgrades: bigger credit tank, faster credits, more robot arms, faster building, cheaper ideas, fewer bugs, a bug fixer robot, advertising and more cash.

Dev mode: press 🛠️ Dev to open every idea for free and get 100000 cash for bug testing. Times made in dev mode are not saved. Reload the page to play for real.

All ideas, bugs and the rocket are 2D sprites drawn with canvas shapes in `sprites.js` (made for this game, no image files).

Boss bugs: once 6 ideas are built, some bugs are big boss bugs. Tap one 3 times to squash it. While it is live it scares away players 3 times as much as a normal bug.
