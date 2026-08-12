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

This is the *only* place the environment is chosen. It sets the base URL this app mints invite
tokens against **and** is handed to onRamp as `config.region`. That second half matters: the onRamp
bundle bakes its own `VITE_REACT_APP_LEEN_BASE_URL` at build time in its own repo, so without an
explicit region the dev bundle always talks to `api.dev.leen.dev` — and a token minted here against
prod fails validation there with a misleading "Invalid or expired connection invite token".
Deriving both from one value is what keeps them from drifting apart.

`bundleVersion` stays independent on purpose: with a region set, running the dev bundle against the
prod API is a valid combination.

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

