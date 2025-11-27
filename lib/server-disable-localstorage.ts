// Some environments start Node with a `--localstorage-file` flag that installs
// a broken globalThis.localStorage object (without getItem). Remove it so
// server-side code behaves as expected.
const ls = (globalThis as any).localStorage;
if (ls && typeof ls.getItem !== 'function') {
  try {
    delete (globalThis as any).localStorage;
  } catch {
    // If deletion fails, set it to undefined
    (globalThis as any).localStorage = undefined;
  }
}

// Also ensure localStorage is completely undefined on server
if (typeof window === 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') {
  try {
    delete (globalThis as any).localStorage;
  } catch {
    (globalThis as any).localStorage = undefined;
  }
}
