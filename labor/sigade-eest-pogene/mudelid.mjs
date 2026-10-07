// Low-poly models built from the engine's shapes.
// Every model looks towards +z and stands on y = 0.
import { box, cone, cylinder, disc, merge, sphere, tile, transform } from './mootor.mjs';

const QUILL = '#5a3a28';

// Rings of quills on a ball: [angle from the top, how many, how far around the back].
function quills(centre, radii, rings) {
  const list = [];
  for (const [lat, count, spread] of rings) {
    for (let i = 0; i < count; i++) {
      const lon = Math.PI + spread * ((i + 0.5) / count - 0.5) * 2;
      const at = [
        centre[0] + Math.sin(lat) * Math.sin(lon) * radii[0] * 0.85,
        centre[1] + Math.cos(lat) * radii[1] * 0.85,
        centre[2] + Math.sin(lat) * Math.cos(lon) * radii[2] * 0.85,
      ];
      list.push(transform(cone(0.09, 0.34, QUILL, 4), { at, rot: [lat, lon, 0] }));
    }
  }
  return list;
}

export function hedgehog() {
  const centre = [0, 0.34, -0.05];
  const radii = [0.42, 0.3, 0.52];
  return merge(
    sphere(radii, '#9a6a48', centre),
    ...quills(centre, radii, [[0.25, 4, Math.PI], [0.75, 7, Math.PI * 0.8], [1.25, 8, Math.PI * 0.7], [1.7, 6, Math.PI * 0.55]]),
    sphere([0.24, 0.21, 0.22], '#f3cfa2', [0, 0.3, 0.36]),
    transform(cone(0.11, 0.26, '#f3cfa2', 6), { at: [0, 0.27, 0.5], rot: [Math.PI / 2, 0, 0] }),
    sphere(0.06, '#2b2340', [0, 0.27, 0.77], 6, 4),
    sphere(0.045, '#2b2340', [-0.12, 0.4, 0.54], 6, 3),
    sphere(0.045, '#2b2340', [0.12, 0.4, 0.54], 6, 3),
    sphere(0.06, '#c48a63', [-0.17, 0.48, 0.3], 6, 3),
    sphere(0.06, '#c48a63', [0.17, 0.48, 0.3], 6, 3),
    ...[[-0.2, 0.25], [0.2, 0.25], [-0.2, -0.3], [0.2, -0.3]].map(([x, z]) => sphere([0.09, 0.06, 0.11], '#c48a63', [x, 0.06, z], 6, 3)),
  );
}

// The hedgehog rolled up into a prickly ball.
export function hedgehogBall() {
  const centre = [0, 0.4, 0];
  const radii = [0.4, 0.4, 0.4];
  return merge(
    sphere(radii, '#9a6a48', centre),
    ...quills(centre, radii, [[0.2, 3, Math.PI], [0.75, 7, Math.PI], [1.35, 9, Math.PI], [1.95, 8, Math.PI], [2.5, 5, Math.PI]]),
    sphere([0.12, 0.1, 0.06], '#f3cfa2', [0, 0.38, 0.39], 6, 3),
  );
}

export function pig() {
  const skin = '#ffa6c0';
  const dark = '#f07a9c';
  return merge(
    sphere([0.42, 0.38, 0.62], skin, [0, 0.66, 0]),
    sphere([0.32, 0.3, 0.3], '#ffb6cb', [0, 0.82, 0.56]),
    transform(cylinder(0.15, 0.14, dark, 8), { at: [0, 0.76, 0.8], rot: [Math.PI / 2, 0, 0] }),
    sphere(0.035, '#6b274b', [-0.05, 0.78, 0.95], 5, 3),
    sphere(0.035, '#6b274b', [0.05, 0.78, 0.95], 5, 3),
    sphere(0.045, '#2b2340', [-0.13, 0.92, 0.82], 6, 3),
    sphere(0.045, '#2b2340', [0.13, 0.92, 0.82], 6, 3),
    transform(cone(0.11, 0.2, dark, 5), { at: [-0.18, 1.05, 0.5], rot: [0.2, 0, 0.5] }),
    transform(cone(0.11, 0.2, dark, 5), { at: [0.18, 1.05, 0.5], rot: [0.2, 0, -0.5] }),
    ...[[-0.22, 0.3], [0.22, 0.3], [-0.22, -0.3], [0.22, -0.3]].map(([x, z]) => cylinder(0.1, 0.38, dark, 6, [x, 0, z])),
    sphere(0.08, dark, [0, 0.75, -0.62], 5, 3),
  );
}

export function apple() {
  return merge(
    sphere(0.26, '#ff4d4d', [0, 0.3, 0], 8, 5),
    cylinder(0.03, 0.15, '#7a4a24', 4, [0, 0.52, 0]),
    sphere([0.11, 0.03, 0.06], '#4cbf4c', [0.1, 0.62, 0], 5, 3),
  );
}

export function fir() {
  return merge(
    cylinder(0.22, 1.0, '#8b5a2b', 6),
    cone(1.3, 1.6, '#2f9e4f', 7, [0, 0.8, 0]),
    cone(1.0, 1.4, '#3fb85a', 7, [0, 1.7, 0]),
    cone(0.65, 1.1, '#5bd16a', 7, [0, 2.6, 0]),
  );
}

export function leafyTree() {
  return merge(
    cylinder(0.24, 1.4, '#8b5a2b', 6),
    sphere(1.1, '#4cbf5a', [0, 2.2, 0], 8, 5),
    sphere(0.7, '#6bd66b', [0.45, 2.8, 0.2], 7, 4),
    sphere(0.12, '#ff4d4d', [0.6, 2.0, 0.85], 5, 3),
    sphere(0.12, '#ff4d4d', [-0.75, 2.45, 0.7], 5, 3),
  );
}

// A wooden fence around the square meadow from -size to size.
export function fence(size) {
  const parts = [];
  for (let i = -size; i <= size; i += 5) {
    parts.push(box(0.2, 1.1, 0.2, '#c98b4f', [i, 0, -size]), box(0.2, 1.1, 0.2, '#c98b4f', [i, 0, size]));
    if (Math.abs(i) !== size) parts.push(box(0.2, 1.1, 0.2, '#c98b4f', [-size, 0, i]), box(0.2, 1.1, 0.2, '#c98b4f', [size, 0, i]));
  }
  for (let i = -size; i < size; i += 5) {
    parts.push(
      box(5, 0.14, 0.08, '#e0a565', [i + 2.5, 0.6, -size]),
      box(5, 0.14, 0.08, '#e0a565', [i + 2.5, 0.6, size]),
      box(0.08, 0.14, 5, '#e0a565', [-size, 0.6, i + 2.5]),
      box(0.08, 0.14, 5, '#e0a565', [size, 0.6, i + 2.5]),
    );
  }
  return merge(...parts);
}

// Checkered grass: bright inside the fence, darker outside.
export function ground(size, outer = 50, step = 5) {
  const tiles = [];
  for (let x = -outer; x < outer; x += step) {
    for (let z = -outer; z < outer; z += step) {
      const inside = x >= -size && x < size && z >= -size && z < size;
      const even = Math.abs((x + z) / step) % 2 === 0;
      const color = inside ? (even ? '#9ad86f' : '#8ccd62') : (even ? '#7fbf5a' : '#78b654');
      tiles.push(tile(x, z, step, color));
    }
  }
  return merge(...tiles);
}

export function shadow() {
  return disc(0.5, '#6aa84f', 10, [0, 0.02, 0]);
}
