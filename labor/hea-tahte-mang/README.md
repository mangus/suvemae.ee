# Hea tahte mäng

A small game about the Suvemäe Good Will Agreement (*Hea tahte kokkulepe*).

You are a student walking around the Suvemäe house: the classroom, the Suvemäe ring, the play corner and the kitchen. Students and teachers sometimes get a red **!** above their head. Walk to them and choose what to do. When your choice follows the agreement (Minu keha, Minu nimi, Minu asjad, Minu Maa, Stopp, restorative conflict solving, THINK before you speak, coaching and more), you get a heart. Picking up litter also gives a heart. Collect 12 hearts to finish the day and see the stickers for the agreements you followed.

## How to play

- Tap or click where you want to walk, or drag your finger. Arrow keys and WASD work too.
- Walk up to someone with a **!** and pick an answer.
- Your best time is kept in your own browser (`localStorage`).

## Made by

The Ruta group at Suvemäe. Made with the help of the Suvemäe labor [AI agent on mintbot.ai](https://mintbot.ai/).

## Material

All drawings are original code-drawn canvas illustrations (no outside image assets). The human characters translate the supplied picture-book reference's fine uneven ink, translucent watercolour, paper grain, ornamental curls and scalloped seams into asymmetric human silhouettes, long noses, tiny eyes and wiry limbs. Warm mustard and red details sit alongside the player's chosen colours; all head, body (including triangle), hair, skin and accessory choices remain available. The reference is not copied or distributed. The rules come from the school's own Good Will Agreement. Sounds are generated with Web Audio.

## Rendering checks

Run `node --check mang.js` and, with Python, uv and Chromium installed, `uv run --with playwright tests/rendering.py`. The browser test checks sprite-edge clipping for every head/body/hair combination at teacher scale with all accessories, exercises every builder button, and checks touch movement and horizontal overflow at 390px. Screenshots are written alongside the test for visual inspection; they are not game assets.
