// Single source of truth for which Leen environment this demo talks to.
//
// Two separate artifacts make Leen API calls: this host app (minting invite
// tokens) and the onRamp bundle loaded from static.leen.dev (validating that
// token and creating the connection). Both repos happen to define a build-time
// `VITE_REACT_APP_LEEN_BASE_URL`, which makes them look coordinated — they are
// not. The bundle's copy is baked in when *that* repo's CI builds it, so the
// dev bundle always defaults to api.dev.leen.dev no matter what this app is
// configured with. A prod-minted token then fails validation against dev with
// a confusing "Invalid or expired connection invite token".
//
// The fix is to resolve one region here and use it for both: it picks this
// app's base URL, and is passed to onRamp as `config.region`, which takes
// priority over the bundle's baked-in default.
//
// `bundleVersion` stays independent on purpose — with a region set, a dev
// bundle pointed at the prod API is a valid (and useful) combination.

export type LeenRegion = string;

const REGION_TO_BASE_URL: Record<string, string> = {
  us: 'https://api.leen.dev/v1',
  'us-dev': 'https://api.dev.leen.dev/v1',
  'eu-c1': 'https://api.eu-c1.leen.dev/v1',
};

/**
 * Recover a region from an explicit base URL.
 *
 * Deployments (e.g. the Cloudflare Worker build) configure
 * `VITE_REACT_APP_LEEN_BASE_URL` rather than a region, so honour it — but map
 * it back to a region rather than using it directly, so onRamp can be handed
 * the matching `config.region`. Using the URL for our half while leaving the
 * bundle on its baked-in default is exactly the drift this module exists to
 * prevent. Returns null for a host that has no region equivalent.
 */
export function regionFromBaseUrl(baseUrl?: string): LeenRegion | null {
  if (!baseUrl) return null;
  let host: string;
  try {
    host = new URL(baseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const [region, url] of Object.entries(REGION_TO_BASE_URL)) {
    if (new URL(url).hostname === host) return region;
  }
  // onRamp's fallback shape: api.<region>.leen.dev
  const match = /^api\.([a-z0-9-]+)\.leen\.dev$/.exec(host);
  return match ? match[1] : null;
}

// Precedence: explicit region, then a region recovered from a configured base
// URL (back-compat with existing deployments), then prod.
const CONFIGURED_BASE_URL: string | undefined = import.meta.env
  .VITE_REACT_APP_LEEN_BASE_URL;

export const LEEN_REGION: LeenRegion =
  import.meta.env.VITE_LEEN_REGION ??
  regionFromBaseUrl(CONFIGURED_BASE_URL) ??
  'us';

// Mirrors getApiBaseUrl() in the onRamp component (src/lib/utils.ts), so both
// sides resolve the same region string to the same host.
export function leenApiBaseUrl(region: LeenRegion = LEEN_REGION): string {
  const known = REGION_TO_BASE_URL[region.toLowerCase()];
  if (known) return known;
  return `https://api.${region}.leen.dev/v1`;
}

/**
 * True when a base URL was configured that has no region equivalent. We can
 * still call it ourselves, but onRamp only accepts a region, so the two halves
 * cannot be kept in sync — surfaced rather than failing silently later.
 */
export const HAS_UNMAPPABLE_BASE_URL =
  !import.meta.env.VITE_LEEN_REGION &&
  !!CONFIGURED_BASE_URL &&
  regionFromBaseUrl(CONFIGURED_BASE_URL) === null;

// The base URL this app actually uses. Falls back to a non-region-mapped
// configured URL so a custom host keeps working.
export function hostAppBaseUrl(): string {
  if (HAS_UNMAPPABLE_BASE_URL && CONFIGURED_BASE_URL) return CONFIGURED_BASE_URL;
  return leenApiBaseUrl();
}

if (HAS_UNMAPPABLE_BASE_URL) {
  console.warn(
    `[leen] VITE_REACT_APP_LEEN_BASE_URL="${CONFIGURED_BASE_URL}" has no region ` +
      `equivalent, so onRamp cannot be pointed at it and will use the base URL ` +
      `baked into its bundle. Set VITE_LEEN_REGION to keep both in sync.`,
  );
}
