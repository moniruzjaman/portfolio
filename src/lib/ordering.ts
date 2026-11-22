/**
 * ordering.ts — how the catalogue is ordered, and what counts as new.
 *
 * Deliberately dependency-free and pure, like `shelf.ts`: the rules live here
 * so they can be reasoned about and tested on their own, and so `data.ts` can
 * bind them to the synced snapshot without either module importing the other.
 *
 * Two dates describe a repository, and they answer different questions:
 *
 *   `createdAt` — when the work was *started*. Newest first leads the
 *                 catalogue, because "what is new" is the question a visitor
 *                 to an ecosystem page actually has.
 *   `pushedAt`  — when it was last *touched*. Useful for "what is still being
 *                 worked on", which is a different sort.
 *
 * A repo pushed today may have been started two years ago, so conflating the
 * two was never right.
 */

/** A repository as far as ordering is concerned — the minimum the rules need. */
export type Sortable = {
  name: string;
  pushedAt: string;
  /** When the repository was created. Absent if GitHub did not report it. */
  createdAt?: string | null;
};

/** A repo counts as new if it was created inside this window before the snapshot. */
export const NEW_WINDOW_DAYS = 30;

const DAY_MS = 86_400_000;

const createdTime = (r: Sortable): number => (r.createdAt ? Date.parse(r.createdAt) : Number.NaN);

/**
 * Was this work started inside the new window?
 *
 * `snapshotAt` is the moment the catalogue was synced, not the visitor's
 * clock. Every page is prerendered at build time and hydrated in the browser,
 * so an age measured from `Date.now()` would be baked into the HTML and could
 * disagree with the hydrated copy. Measuring from the snapshot keeps the two
 * identical — and it is the honest reference anyway: the catalogue describes
 * the repos as they were when it was scanned.
 */
export function isNew(r: Sortable, snapshotAt: number): boolean {
  if (!r.createdAt) return false;
  const created = createdTime(r);
  if (!Number.isFinite(created)) return false;
  const age = snapshotAt - created;
  return age >= 0 && age < NEW_WINDOW_DAYS * DAY_MS;
}

/**
 * Newest creation first.
 *
 * Repos with no recorded creation fall back to push time, then name, so the
 * order is total and deterministic — the same list on the server, in the
 * browser, and in the prerendered HTML.
 */
export function byCreation(a: Sortable, b: Sortable): number {
  const ca = createdTime(a);
  const cb = createdTime(b);
  if (Number.isFinite(ca) && Number.isFinite(cb) && ca !== cb) return cb - ca;
  if (Number.isFinite(ca) !== Number.isFinite(cb)) return Number.isFinite(ca) ? -1 : 1;
  return b.pushedAt.localeCompare(a.pushedAt) || a.name.localeCompare(b.name);
}

/** Most recently pushed first — "what is still being worked on". */
export function byActivity(a: Sortable, b: Sortable): number {
  return b.pushedAt.localeCompare(a.pushedAt) || a.name.localeCompare(b.name);
}
