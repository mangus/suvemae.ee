import assert from 'node:assert/strict';
import { movePlayer, chasePlayer, isCaught } from './game-core.mjs';

const openMap = [
  '#####',
  '#...#',
  '#...#',
  '#...#',
  '#####',
];

const moved = movePlayer({ x: 2, y: 2 }, 1, 0, openMap);
assert.deepEqual(moved, { x: 3, y: 2 }, 'player moves through an open tile');

const blocked = movePlayer({ x: 3.7, y: 2 }, 1, 0, openMap);
assert.ok(blocked.x < 4, 'player cannot walk through a wall');

const pig = chasePlayer({ x: 1, y: 1 }, { x: 3, y: 1 }, 0.5, openMap);
assert.ok(pig.x > 1 && pig.y === 1, 'pig moves toward the player');

assert.equal(isCaught({ x: 2, y: 2 }, { x: 2.3, y: 2.2 }), true, 'nearby pig catches player');
assert.equal(isCaught({ x: 2, y: 2 }, { x: 3, y: 3 }), false, 'distant pig does not catch player');

console.log('game-core tests passed');
