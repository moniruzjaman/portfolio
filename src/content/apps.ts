/**
 * Flagship order — the one piece of curation in an otherwise generated catalogue.
 *
 * Names are repo names. A name that no longer exists in the generated data is
 * dropped silently by `flagship`, so renaming a repo cannot break the build.
 * Everything else about an app (title, description, hosts, brand) is generated.
 */
export const FLAGSHIP_NAMES = [
  "web.krishiai.live",
  "soil-media-portal",
  "plantation-tracker",
  "cabi-diagnosis",
  "krishak-card",
  "pesticide-field-guide",
] as const;
