import assert from 'node:assert/strict';
import { SIZE, chase, freeSpot, isCaught, knockBack, makeTrees, random, resolve, separate, step } from './game-core.mjs';

const tree = { x: 0, z: 0, r: 0.5 };

const pushed = resolve({ x: 0.3, z: 0 }, 0.4, [tree]);
assert.ok(Math.hypot(pushed.x, pushed.z) >= 0.9 - 1e-9, 'nobody stands inside a tree');

const atFence = step({ x: SIZE - 1, z: 0 }, 5, 0, 0.4, []);
assert.equal(atFence.x, SIZE - 0.4, 'the fence stops the hedgehog');

const straight = chase({ x: 5, z: 5 }, { x: 0, z: 5 }, 1, []);
assert.ok(straight.x < 5 && Math.abs(straight.z - 5) < 1e-9, 'a pig runs straight at the hedgehog');
assert.ok(Math.abs(straight.heading + Math.PI / 2) < 1e-9, 'the pig looks where it runs');

const around = chase({ x: 0, z: -2 }, { x: 0, z: 3 }, 0.5, [tree]);
assert.ok(Math.abs(around.x) > 0.1, 'a pig steers around a tree in its way');

assert.equal(isCaught({ x: 0, z: 0 }, { x: 0.5, z: 0.3 }), true, 'a pig next to the hedgehog catches it');
assert.equal(isCaught({ x: 0, z: 0 }, { x: 2, z: 0 }), false, 'a pig further away does not');

const bounced = knockBack({ x: 1, z: 0 }, { x: 0, z: 0 }, 2, []);
assert.equal(bounced.x, 3, 'quills push a pig away from the hedgehog');

const pair = [{ x: 0, z: 0 }, { x: 0.2, z: 0 }];
separate(pair, 1, []);
assert.ok(pair[1].x - pair[0].x >= 1 - 1e-9, 'pigs do not stand inside each other');

const forest = makeTrees(24, random(2026));
assert.deepEqual(forest, makeTrees(24, random(2026)), 'the same seed grows the same forest');
assert.ok(forest.length >= 20, 'the meadow gets its trees');
assert.ok(forest.every((t) => Math.hypot(t.x, t.z) >= 4), 'the start is clear of trees');

const spot = freeSpot(random(3), forest, [{ x: 0, z: 0 }], 6);
assert.ok(Math.hypot(spot.x, spot.z) >= 6, 'an apple appears away from the hedgehog');
assert.ok(forest.every((t) => Math.hypot(t.x - spot.x, t.z - spot.z) >= t.r + 1), 'an apple never grows inside a tree');

console.log('game-core tests passed');
