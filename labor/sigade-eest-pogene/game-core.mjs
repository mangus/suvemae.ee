export function isWall(map, x, y) {
  const row = map[Math.floor(y)];
  return !row || row[Math.floor(x)] !== '.';
}

export function movePlayer(position, dx, dy, map, radius = 0.2) {
  let { x, y } = position;
  const nextX = x + dx;
  if (!isWall(map, nextX + Math.sign(dx) * radius, y)) x = nextX;
  const nextY = y + dy;
  if (!isWall(map, x, nextY + Math.sign(dy) * radius)) y = nextY;
  return { x, y };
}

export function chasePlayer(pig, player, distance, map) {
  const dx = player.x - pig.x;
  const dy = player.y - pig.y;
  const length = Math.hypot(dx, dy) || 1;
  return movePlayer(pig, dx / length * distance, dy / length * distance, map, 0.18);
}

export function isCaught(player, pig, catchDistance = 0.55) {
  return Math.hypot(player.x - pig.x, player.y - pig.y) < catchDistance;
}
