import { buildSeed, type MockDb } from "./seed";

let db: MockDb = buildSeed();
const listeners = new Set<() => void>();

export function getDb(): MockDb {
  return db;
}

export function setDb(next: MockDb) {
  db = next;
  listeners.forEach((l) => l());
}

export function subscribeDb(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetDb() {
  setDb(buildSeed());
}

export function patchDb(updater: (draft: MockDb) => void) {
  const next = structuredClone(db);
  updater(next);
  setDb(next);
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function mockIds() {
  return { uid };
}

export { uid };
