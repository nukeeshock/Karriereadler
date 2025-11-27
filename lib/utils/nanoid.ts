export function nanoid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 21);
  }
  return Math.random().toString(36).slice(2, 15);
}
