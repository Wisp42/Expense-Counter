type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to "the transactions table changed" notifications. Returns an unsubscribe fn. */
export function subscribeDbChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyDbChange(): void {
  for (const fn of listeners) fn();
}
