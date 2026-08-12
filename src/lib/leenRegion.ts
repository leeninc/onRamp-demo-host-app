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
// So neither side reads a base URL from this app's env any more. `VITE_LEEN_REGION`
// is the only knob: it picks this app's base URL *and* is passed to onRamp as
// `config.region`, which takes priority over the bundle's baked-in default.
//
// Note this deliberately leaves `bundleVersion` independent — with `region` set,
// a dev bundle pointed at the prod API is a valid (and useful) combination.

export const LEEN_REGION = import.meta.env.VITE_LEEN_REGION ?? 'us';

// Mirrors getApiBaseUrl() in the onRamp component (src/lib/utils.ts), so both
// sides resolve the same region string to the same host.
export function leenApiBaseUrl(region: string = LEEN_REGION): string {
  switch (region.toLowerCase()) {
    case 'us':
      return 'https://api.leen.dev/v1';
    case 'us-dev':
      return 'https://api.dev.leen.dev/v1';
    case 'eu-c1':
      return 'https://api.eu-c1.leen.dev/v1';
    default:
      return `https://api.${region}.leen.dev/v1`;
  }
}
