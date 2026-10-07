// Mootor: a tiny flat-shaded 3D engine that draws on a 2D canvas.
// Meshes are built from simple shapes and placed in the world as objects
// ({ mesh, x, y, z, rotY, scale }). render() draws them back to front from
// a camera ({ x, y, z, yaw, pitch }). Forward is +z, up is +y, yaw turns right.

const DEFAULTS = {
  fov: 1.15, // horizontal field of view in radians
  near: 0.1,
  far: 38,
  fogStart: 16,
  ambient: 0.5,
  light: [-0.45, 1, -0.35],
  sky: '#6ec3ff',
  fog: '#d4f1de',
};

export function hex(color) {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};
const range = (n) => Array.from({ length: n }, (_, i) => i);

function finish(points, faces) {
  let radius = 0;
  for (const p of points) radius = Math.max(radius, Math.hypot(p[0], p[1], p[2]));
  return { points, faces, radius };
}

// Turn every face to look away from the centre of its shape;
// render() relies on this to skip faces that look away from the camera.
function outward(points, faces, centre) {
  for (const face of faces) {
    const [a, b, c] = face.v.map((i) => points[i]);
    const middle = [0, 1, 2].map((k) => face.v.reduce((sum, i) => sum + points[i][k], 0) / face.v.length);
    if (dot(cross(sub(b, a), sub(c, a)), sub(middle, centre)) < 0) face.v.reverse();
  }
  return finish(points, faces);
}

function shape(points, faces, color, centre) {
  const c = hex(color);
  return outward(points, faces.map((v) => ({ v, c })), centre);
}

function ring(r, y, seg, at) {
  return range(seg).map((i) => {
    const a = i / seg * Math.PI * 2;
    return [at[0] + Math.sin(a) * r, y, at[2] + Math.cos(a) * r];
  });
}

// For box, cylinder and cone `at` is the middle of the bottom; for sphere it is the centre.
export function box(w, h, d, color, at = [0, 0, 0]) {
  const [x, y, z] = at;
  const a = w / 2;
  const b = d / 2;
  const points = [
    [x - a, y, z - b], [x + a, y, z - b], [x + a, y, z + b], [x - a, y, z + b],
    [x - a, y + h, z - b], [x + a, y + h, z - b], [x + a, y + h, z + b], [x - a, y + h, z + b],
  ];
  const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  return shape(points, faces, color, [x, y + h / 2, z]);
}

export function cylinder(r, h, color, seg = 8, at = [0, 0, 0]) {
  const points = [...ring(r, at[1], seg, at), ...ring(r, at[1] + h, seg, at)];
  const faces = [range(seg), range(seg).map((i) => i + seg)];
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    faces.push([i, j, seg + j, seg + i]);
  }
  return shape(points, faces, color, [at[0], at[1] + h / 2, at[2]]);
}

export function cone(r, h, color, seg = 8, at = [0, 0, 0]) {
  const points = [...ring(r, at[1], seg, at), [at[0], at[1] + h, at[2]]];
  const faces = [range(seg)];
  for (let i = 0; i < seg; i++) faces.push([i, (i + 1) % seg, seg]);
  return shape(points, faces, color, [at[0], at[1] + h / 4, at[2]]);
}

// radius is a number or [rx, ry, rz] for a squashed ball.
export function sphere(radius, color, at = [0, 0, 0], seg = 8, rings = 5) {
  const [rx, ry, rz] = Array.isArray(radius) ? radius : [radius, radius, radius];
  const [x, y, z] = at;
  const points = [[x, y + ry, z]];
  for (let i = 1; i < rings; i++) {
    const t = i / rings * Math.PI;
    for (let j = 0; j < seg; j++) {
      const a = j / seg * Math.PI * 2;
      points.push([x + Math.sin(t) * Math.sin(a) * rx, y + Math.cos(t) * ry, z + Math.sin(t) * Math.cos(a) * rz]);
    }
  }
  const bottom = points.length;
  points.push([x, y - ry, z]);
  const p = (i, j) => 1 + (i - 1) * seg + (j % seg);
  const faces = [];
  for (let j = 0; j < seg; j++) {
    faces.push([0, p(1, j), p(1, j + 1)]);
    faces.push([bottom, p(rings - 1, j + 1), p(rings - 1, j)]);
    for (let i = 1; i < rings - 1; i++) faces.push([p(i, j), p(i, j + 1), p(i + 1, j + 1), p(i + 1, j)]);
  }
  return shape(points, faces, color, at);
}

// A flat round patch facing up, for shadows.
export function disc(r, color, seg = 10, at = [0, 0, 0]) {
  return shape(ring(r, at[1], seg, at), [range(seg)], color, [at[0], at[1] - 1, at[2]]);
}

// A flat square facing up, for the ground.
export function tile(x, z, size, color, y = 0) {
  const points = [[x, y, z], [x + size, y, z], [x + size, y, z + size], [x, y, z + size]];
  return shape(points, [[0, 1, 2, 3]], color, [x + size / 2, y - 1, z + size / 2]);
}

// Scale, then turn around x, z and y (rot = [x, y, z] in radians), then move to `at`.
export function transform(mesh, { at = [0, 0, 0], rot = [0, 0, 0], scale = 1 } = {}) {
  const [sx, sy, sz] = Array.isArray(scale) ? scale : [scale, scale, scale];
  const [ax, ay, az] = rot;
  const points = mesh.points.map(([x, y, z]) => {
    x *= sx;
    y *= sy;
    z *= sz;
    [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
    [x, y] = [x * Math.cos(az) - y * Math.sin(az), x * Math.sin(az) + y * Math.cos(az)];
    [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
    return [x + at[0], y + at[1], z + at[2]];
  });
  return finish(points, mesh.faces.map((face) => ({ v: [...face.v], c: face.c })));
}

export function merge(...meshes) {
  const points = [];
  const faces = [];
  for (const mesh of meshes) {
    const offset = points.length;
    points.push(...mesh.points);
    for (const face of mesh.faces) faces.push({ v: face.v.map((i) => i + offset), c: face.c });
  }
  return finish(points, faces);
}

function clipNear(points, near) {
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const aIn = a[2] >= near;
    if (aIn) out.push(a);
    if (aIn !== (b[2] >= near)) {
      const t = (near - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near]);
    }
  }
  return out;
}

// Draw layers of objects; each layer is sorted on its own and drawn over the
// previous one (ground, then shadows, then everything standing on the ground).
// Returns the number of polygons drawn.
export function render(ctx, camera, layers, look = {}) {
  const s = { ...DEFAULTS, ...look };
  const { width: w, height: h } = ctx.canvas;
  const f = w / 2 / Math.tan(s.fov / 2);
  const cosY = Math.cos(camera.yaw);
  const sinY = Math.sin(camera.yaw);
  const cosP = Math.cos(camera.pitch);
  const sinP = Math.sin(camera.pitch);
  const light = unit(s.light);
  const fog = hex(s.fog);
  const eye = [camera.x, camera.y, camera.z];

  const toView = (p) => {
    const dx = p[0] - camera.x;
    const dy = p[1] - camera.y;
    const dz = p[2] - camera.z;
    const x = dx * cosY - dz * sinY;
    const z = dx * sinY + dz * cosY;
    return [x, dy * cosP + z * sinP, z * cosP - dy * sinP];
  };

  // Sky above the horizon, fog-coloured land below it.
  const horizon = Math.max(1, Math.min(h, h / 2 - Math.tan(camera.pitch) * f));
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, s.sky);
  sky.addColorStop(1, s.fog);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);
  ctx.fillStyle = s.fog;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';

  let drawn = 0;
  for (const layer of layers) {
    const polygons = [];
    for (const object of layer) collect(object, polygons);
    polygons.sort((a, b) => b.depth - a.depth);
    for (const { points, color } of polygons) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.strokeStyle = color; // the outline hides thin cracks between faces
      ctx.fill();
      ctx.stroke();
    }
    drawn += polygons.length;
  }
  return drawn;

  function collect(object, polygons) {
    const { mesh } = object;
    const scale = object.scale ?? 1;
    const ox = object.x ?? 0;
    const oy = object.y ?? 0;
    const oz = object.z ?? 0;
    const reach = mesh.radius * scale;
    const centre = toView([ox, oy, oz]);
    if (centre[2] < -reach || centre[2] - reach > s.far) return;
    const cosR = Math.cos(object.rotY ?? 0);
    const sinR = Math.sin(object.rotY ?? 0);
    const world = mesh.points.map(([x, y, z]) => [
      (x * cosR + z * sinR) * scale + ox,
      y * scale + oy,
      (-x * sinR + z * cosR) * scale + oz,
    ]);
    const view = world.map(toView);
    for (const face of mesh.faces) {
      const a = world[face.v[0]];
      const normal = cross(sub(world[face.v[1]], a), sub(world[face.v[2]], a));
      if (dot(normal, sub(eye, a)) <= 0) continue;
      let points = face.v.map((i) => view[i]);
      if (points.some((p) => p[2] < s.near)) points = clipNear(points, s.near);
      if (points.length < 3) continue;
      const depth = points.reduce((sum, p) => sum + p[2], 0) / points.length;
      if (depth > s.far) continue;
      const lit = s.ambient + (1 - s.ambient) * Math.max(0, dot(unit(normal), light));
      const haze = Math.min(1, Math.max(0, (depth - s.fogStart) / (s.far - s.fogStart)));
      const rgb = face.c.map((v, k) => Math.round(Math.min(255, v * lit) * (1 - haze) + fog[k] * haze));
      polygons.push({
        depth,
        color: `rgb(${rgb})`,
        points: points.map((p) => [w / 2 + p[0] / p[2] * f, h / 2 - p[1] / p[2] * f]),
      });
    }
  }
}
