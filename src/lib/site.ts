/**
 * Deployment base path, in one place.
 *
 * Vite exposes the configured `base` as BASE_URL ("/portfolio/" for a GitHub
 * project site, "/" for a user site or custom domain). Everything that needs the
 * prefix reads it from here so the app works at either location without edits.
 *
 * The router needs it WITHOUT the trailing slash — wouter only strips a base it is
 * told about, and without this every route 404s under a sub-path (verified; see
 * the change log in content/design-system.md).
 */
export const BASE_URL: string = import.meta.env.BASE_URL;
export const ROUTER_BASE: string = BASE_URL.replace(/\/$/, "");

/** URL of a file in /public, honouring the base path. */
export const asset = (path: string): string => `${BASE_URL}${path.replace(/^\//, "")}`;
