// Game rules without any drawing, so they can be tested in Node.
// Positions are { x, z } on the ground; headings are radians, 0 looks towards +z.

export const SIZE = 20; // the fenced meadow reaches from -SIZE to SIZE

// A small seeded random generator, so the forest is the same every time.
export function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeTrees(count, rand, clear = 4) {
  const trees = [];
  for (let tries = 0; trees.length < count && tries < count * 60; tries++) {
    const x = (rand() * 2 - 1) * (SIZE - 2);
    const z = (rand() * 2 - 1) * (SIZE - 2);
    if (Math.hypot(x, z) < clear) continue;
    if (trees.some((tree) => Math.hypot(tree.x - x, tree.z - z) < 3.4)) continue;
    trees.push({ x, z, r: 0.55, size: 0.8 + rand() * 0.6 });
  }
  return trees;
}

// Push a round creature out of trees and keep it inside the fence.
export function resolve(position, radius, trees) {
  let { x, z } = position;
  for (const tree of trees) {
    const dx = x - tree.x;
    const dz = z - tree.z;
    const distance = Math.hypot(dx, dz);
    const min = tree.r + radius;
    if (distance >= min) continue;
    if (distance < 1e-6) {
      x = tree.x + min;
    } else {
      x = tree.x + dx / distance * min;
      z = tree.z + dz / distance * min;
    }
  }
  const edge = SIZE - radius;
  x = Math.max(-edge, Math.min(edge, x));
  z = Math.max(-edge, Math.min(edge, z));
  return { x, z };
}

export function step(position, dx, dz, radius, trees) {
  return resolve({ x: position.x + dx, z: position.z + dz }, radius, trees);
}

// Run towards the target and steer around the nearest tree in the way.
export function chase(pig, target, distance, trees, radius = 0.5) {
  let dx = target.x - pig.x;
  let dz = target.z - pig.z;
  const length = Math.hypot(dx, dz);
  if (length < 1e-6) return { x: pig.x, z: pig.z, heading: pig.heading ?? 0 };
  dx /= length;
  dz /= length;
  let blocker = null;
  let nearest = Infinity;
  for (const tree of trees) {
    const tx = tree.x - pig.x;
    const tz = tree.z - pig.z;
    const ahead = tx * dx + tz * dz;
    const side = tx * dz - tz * dx;
    if (ahead > 0 && ahead < Math.min(2.5, length) && Math.abs(side) < tree.r + radius + 0.2 && ahead < nearest) {
      blocker = side;
      nearest = ahead;
    }
  }
  if (blocker !== null) {
    const turn = blocker >= 0 ? -1 : 1;
    const sx = dz * turn;
    const sz = -dx * turn;
    dx += sx * 1.2;
    dz += sz * 1.2;
    const l = Math.hypot(dx, dz);
    dx /= l;
    dz /= l;
  }
  return { ...step(pig, dx * distance, dz * distance, radius, trees), heading: Math.atan2(dx, dz) };
}

// Move creatures apart so they never stand inside each other.
export function separate(creatures, gap, trees, radius = 0.5) {
  for (let i = 0; i < creatures.length; i++) {
    for (let j = i + 1; j < creatures.length; j++) {
      const a = creatures[i];
      const b = creatures[j];
      let dx = b.x - a.x;
      let dz = b.z - a.z;
      let distance = Math.hypot(dx, dz);
      if (distance >= gap) continue;
      const push = (gap - distance) / 2;
      if (distance < 1e-6) {
        dx = 1;
        dz = 0;
        distance = 1;
      }
      Object.assign(a, step(a, -dx / distance * push, -dz / distance * push, radius, trees));
      Object.assign(b, step(b, dx / distance * push, dz / distance * push, radius, trees));
    }
  }
}

export function knockBack(creature, from, distance, trees, radius = 0.5) {
  const dx = creature.x - from.x;
  const dz = creature.z - from.z;
  const length = Math.hypot(dx, dz) || 1;
  return step(creature, dx / length * distance, dz / length * distance, radius, trees);
}

export function isCaught(hedgehog, pig, catchDistance = 0.85) {
  return Math.hypot(hedgehog.x - pig.x, hedgehog.z - pig.z) < catchDistance;
}

// A random spot away from trees and at least minDistance from everyone in `avoid`
// (or the furthest spot found, if the meadow is too crowded).
export function freeSpot(rand, trees, avoid, minDistance) {
  let best = null;
  let bestDistance = -Infinity;
  for (let i = 0; i < 200; i++) {
    const x = (rand() * 2 - 1) * (SIZE - 2);
    const z = (rand() * 2 - 1) * (SIZE - 2);
    if (trees.some((tree) => Math.hypot(tree.x - x, tree.z - z) < tree.r + 1)) continue;
    const distance = Math.min(Infinity, ...avoid.map((a) => Math.hypot(a.x - x, a.z - z)));
    if (distance >= minDistance) return { x, z };
    if (distance > bestDistance) {
      best = { x, z };
      bestDistance = distance;
    }
  }
  return best ?? { x: 0, z: 0 };
}
