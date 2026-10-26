/**
 * Single source of truth for which hosts the *shipped site* may reference.
 *
 * Imported by verify-no-secrets.mjs (the CI gate) and by the build-time probes
 * (brand-probe.mjs). A brand icon, preview frame or deployment link whose host is
 * not on this list is dropped at sync time instead of failing the build later.
 */

export const ALLOWED_HOSTS = [
  // fonts
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  // source + published sites
  "github.com",
  "moniruzjaman.github.io",
  "raw.githubusercontent.com",
  "user-images.githubusercontent.com",
  "camo.githubusercontent.com",
  "avatars.githubusercontent.com",
  "api.github.com",
  // the four deployment channels this portfolio showcases
  "krishiai.live",
  "vercel.app",
  "workers.dev",
  "pages.dev",
  "surge.sh",
  // Google Drive library: link-out and click-to-load preview frames only
  "drive.google.com",
  "docs.google.com",
];

export const hostOf = (u) => {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return null;
  }
};

export const hostAllowed = (host) =>
  Boolean(host) && ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

export const urlAllowed = (u) => {
  try {
    const url = new URL(u);
    return (url.protocol === "https:" || url.protocol === "http:") && hostAllowed(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};
