export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function moveFighter(position, direction, elapsedMs, arena) {
  const length = Math.hypot(direction.x, direction.y) || 1;
  const speed = 200;
  const distance = speed * (elapsedMs / 1000);
  const x = position.x + (direction.x / length) * distance;
  const y = position.y + (direction.y / length) * distance;
  return {
    x: Math.round(clamp(x, 36, arena.width - 36)),
    y: Math.round(clamp(y, 36, arena.height - 36)),
  };
}

export function attackHits(attacker, target) {
  const reachX = 72;
  const reachY = 48;
  const dx = target.x - attacker.x;
  const dy = Math.abs(target.y - attacker.y);
  const pointsForward = attacker.facing >= 0 ? dx >= 10 && dx <= reachX : dx <= -10 && dx >= -reachX;
  return pointsForward && dy <= reachY;
}

export function applyDamage(health, damage) {
  const nextHealth = Math.max(0, health - damage);
  return { health: nextHealth, knockedOut: nextHealth === 0 };
}

// Keeps only whole numbers inside each choice's range, so an odd character
// sent by another player can never break the drawing.
export function cleanCharacter(input, limits) {
  const character = {};
  for (const [key, count] of Object.entries(limits)) {
    const value = input?.[key];
    character[key] = Number.isInteger(value) && value >= 0 && value < count ? value : 0;
  }
  return character;
}
