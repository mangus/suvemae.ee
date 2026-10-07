import assert from 'node:assert/strict';
import { box, render } from './mootor.mjs';
import * as models from './mudelid.mjs';
import { SIZE } from './game-core.mjs';

// A stand-in for a canvas context that counts what would be drawn.
function fakeContext() {
  const calls = { fill: 0, bad: 0 };
  const check = (x, y) => { if (!Number.isFinite(x) || !Number.isFinite(y)) calls.bad++; };
  const ctx = {
    canvas: { width: 800, height: 450 },
    createLinearGradient: () => ({ addColorStop() {} }),
    fillRect() {}, beginPath() {}, closePath() {}, stroke() {},
    moveTo: check,
    lineTo: check,
    fill() { calls.fill++; },
  };
  return { ctx, calls };
}

{
  const { ctx, calls } = fakeContext();
  render(ctx, { x: 0, y: 0.5, z: -5, yaw: 0, pitch: 0 }, [[{ mesh: box(1, 1, 1, '#ff0000') }]]);
  assert.equal(calls.fill, 1, 'a cube seen straight on shows one face');
}

{
  const { ctx, calls } = fakeContext();
  render(ctx, { x: 0, y: 0.5, z: 5, yaw: 0, pitch: 0 }, [[{ mesh: box(1, 1, 1, '#ff0000') }]]);
  assert.equal(calls.fill, 0, 'nothing behind the camera is drawn');
}

{
  const { ctx, calls } = fakeContext();
  const scene = [
    [{ mesh: models.ground(SIZE) }],
    [{ mesh: models.shadow(), x: 0, z: 0 }],
    [
      { mesh: models.fence(SIZE) },
      { mesh: models.fir(), x: 3, z: 6 },
      { mesh: models.leafyTree(), x: -3, z: 8 },
      { mesh: models.hedgehog() },
      { mesh: models.hedgehogBall(), x: 1, z: 2 },
      { mesh: models.pig(), x: 0, z: 4, rotY: Math.PI },
      { mesh: models.apple(), x: 2, z: 3 },
    ],
  ];
  const camera = { x: 0, y: 2.4, z: -4.6, yaw: 0, pitch: 0.36 };
  const drawn = render(ctx, camera, scene);
  assert.ok(drawn > 100 && calls.fill === drawn, 'the whole scene is drawn');
  assert.equal(calls.bad, 0, 'every corner lands on a real screen spot');
  const started = performance.now();
  for (let i = 0; i < 50; i++) render(ctx, { ...camera, yaw: i / 8 }, scene);
  console.log(`${drawn} polygons, ${((performance.now() - started) / 50).toFixed(2)} ms per frame`);
}

console.log('mootor tests passed');
