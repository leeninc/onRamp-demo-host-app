# Leen OnRamp Demo Host App
Demo Host App for Leen's embeddable onboarding component, OnRamp. 

![](demo-screenshot.png)

## How to run
First, you'll want to make sure that you have bun installed in your system.

```bash
brew tap oven-sh/bun
brew install bun@1.0.25
```

Next, install all required project dependencies with:

```bash
bun i
```

Then, create a `.env` file and add the following envvars:

```
VITE_LEEN_REGION=us
VITE_REACT_APP_API_KEY=your-api-key
VITE_REACT_APP_ORG_ID=your-org-id
VITE_REACT_APP_ADMIN_USERNAME=username
VITE_REACT_APP_ADMIN_PASSWORD=password
VITE_MOCK_LEEN=true
```

You can then run the app by running:

```bash
bun run dev
```

### About `VITE_LEEN_REGION`

Which Leen environment the demo talks to. `us` (default) → `api.leen.dev`, `us-dev` →
`api.dev.leen.dev`, `eu-c1` → `api.eu-c1.leen.dev`.

Resolution order, so existing deployments keep working without being touched:

1. `VITE_LEEN_REGION`, if set.
2. Otherwise the region implied by `VITE_REACT_APP_LEEN_BASE_URL` — the Cloudflare Worker build
   sets that rather than a region, so `https://api.dev.leen.dev/v1` resolves to `us-dev` and both
   this app *and* onRamp are pointed at dev.
3. Otherwise `us`.

A base URL pointing at a host with no region equivalent still works for this app's own calls, but
onRamp only accepts a region, so it will fall back to its bundled default — the console warns when
that happens. Set `VITE_LEEN_REGION` to avoid it.

This is the *only* place the environment is chosen. It sets the base URL this app mints invite
tokens against **and** is handed to onRamp as `config.region`. That second half matters: the onRamp
bundle bakes its own `VITE_REACT_APP_LEEN_BASE_URL` at build time in its own repo, so without an
explicit region the dev bundle always talks to `api.dev.leen.dev` — and a token minted here against
prod fails validation there with a misleading "Invalid or expired connection invite token".
Deriving both from one value is what keeps them from drifting apart.

**Pick the region your API key and org actually live in.** They are per-environment: a prod
`VITE_REACT_APP_API_KEY`/`VITE_REACT_APP_ORG_ID` pair does not exist in dev, and pointing at the
wrong one fails with `{"detail":"Invalid Organization ID"}` (HTTP 401). If you see that, this is
almost always why.

`bundleVersion` is **not** related to this and stays independent on purpose — it only selects which
onRamp build to load. `bundleVersion="dev"` with `VITE_LEEN_REGION=us` is the normal setup: the
newest widget code against your prod credentials. Don't switch to `us-dev` just because you're on
the dev bundle.

Vite reads `.env` only at startup, so restart `bun run dev` after changing this.

### About `VITE_MOCK_LEEN`

Only ProcessUnity's invite-token/connection-creation calls are mocked (see `src/mocks/`);
everything else hits the real Leen API exactly as it did before.

**SecurityScorecard – ProcessUnity**: a *push destination*, using the two-connection chained-mount
flow (`HostApp.tsx`). SecurityScorecard (real, already-deployed) connects first; ProcessUnity
(mocked) is then paired to it via its own `options.connection_id`, and Leen pushes data into it on
a schedule.

`SERVICENOW_VR` is an ordinary standalone tile served straight from `GET /connectors` — not a
rebrand and not mocked. It's a pull destination: onRamp's widget detects
`direction: "PULL_DESTINATION"` on the real validate-token response and shows a "Source Connection
ID" input instead of a credentials form. That input accepts any SecurityScorecard connection in the
same org — the API validates it against the destination's `supported_source_vendors`. Requires an
onRamp bundle built after pull-destination support landed (`bundleVersion="dev"` has it; the
`prod/latest` bundle only rebuilds on a tagged release).

With `VITE_MOCK_LEEN=true`, you can click through the ProcessUnity flow without a real ProcessUnity
instance — no connection is actually created. Every other vendor tile, including SecurityScorecard
and ServiceNow VR, is unaffected. Set `VITE_MOCK_LEEN=false` (or omit it) to have all vendors hit
the real API instead.

