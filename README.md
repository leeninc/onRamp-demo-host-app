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
VITE_REACT_APP_LEEN_BASE_URL=https://api.leen.dev/v1
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

### About `VITE_MOCK_LEEN`

Only ProcessUnity's invite-token/connection-creation calls are mocked (see `src/mocks/`);
everything else, hits the real Leen API exactly as it did before.

**SecurityScorecard – ProcessUnity**: a *push destination*, using the two-connection chained-mount
flow (`HostApp.tsx`). SecurityScorecard (real, already-deployed) connects first; ProcessUnity
(mocked) is then paired to it via its own `options.connection_id`, and Leen pushes data into it on
a schedule.

`SERVICENOW_VR` is an ordinary standalone tile served straight from `GET /connectors` — not a
rebrand and not mocked. It's a pull destination: onRamp's widget detects
`direction: "PULL_DESTINATION"` on the real validate-token response and shows a "Source Connection
ID" input instead of a credentials form.

With `VITE_MOCK_LEEN=true`, you can click through the ProcessUnity flow without a real ProcessUnity
instance — no connection is actually created. Every other vendor tile, including SecurityScorecard
and ServiceNow VR, is unaffected. Set `VITE_MOCK_LEEN=false` (or omit it) to have all vendors hit
the real API instead.

