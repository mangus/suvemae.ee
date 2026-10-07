import assert from 'node:assert/strict';
import { clamp, moveFighter, attackHits, applyDamage, cleanCharacter } from './game-core.js';

assert.equal(clamp(-2, 0, 10), 0);
assert.equal(clamp(12, 0, 10), 10);
assert.equal(clamp(4, 0, 10), 4);

const moved = moveFighter({ x: 100, y: 100 }, { x: 1, y: -1 }, 1000, { width: 500, height: 300 });
assert.deepEqual(moved, { x: 241, y: 36 });

assert.equal(attackHits({ x: 100, y: 100, facing: 1 }, { x: 154, y: 105 }), true);
assert.equal(attackHits({ x: 100, y: 100, facing: 1 }, { x: 30, y: 100 }), false);
assert.equal(attackHits({ x: 100, y: 100, facing: -1 }, { x: 45, y: 100 }), true);

assert.deepEqual(applyDamage(30, 12), { health: 18, knockedOut: false });
assert.deepEqual(applyDamage(8, 12), { health: 0, knockedOut: true });

// Characters arriving from other players are reduced to valid choice numbers.
assert.deepEqual(cleanCharacter({ s: 2, h: 99, e: 'x', o: 1.5 }, { s: 4, h: 8, e: 5, o: 6 }), { s: 2, h: 0, e: 0, o: 0 });
assert.deepEqual(cleanCharacter(null, { s: 4 }), { s: 0 });

console.log('Anime Areeni loogikatestid läbisid edukalt.');
