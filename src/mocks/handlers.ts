import { http, HttpResponse, JsonBodyType, passthrough } from 'msw';
import { VENDOR_SCHEMAS } from './schemas';
import { decodeMockToken, encodeMockToken } from './token';

const MOCK_ORG_ID = '5718a24d-f9c8-4276-af80-088ac433e28f';

// Only PROCESSUNITY is mocked (paired via options.connection_id). Every
// other vendor, including SERVICENOW_VR and SECURITY_SCORECARD, hits the
// real Leen API exactly as it would outside this demo — SERVICENOW_VR's
// bound-source-connection test tile now does this too, passing a real
// source connection id via options.connection_id (see useGetConnectors.ts).
const MOCKED_VENDORS = ['PROCESSUNITY'];

// A real invite-token JWT payload has `vendors` (plural array, from
// leen_api/adapters/provisioning/provisioning_adapter.py) — only our own
// mock tokens have a singular `vendor` string. That's the signal used below
// to tell "one of ours" apart from "a real token, let it through."
function decodeIfMocked(token: string) {
  try {
    const payload = decodeMockToken(token);
    if (payload?.vendor && MOCKED_VENDORS.includes(payload.vendor)) {
      return payload;
    }
  } catch {
    // not our token shape — fall through to passthrough
  }
  return null;
}

// Every handler matches on path only (leading "*") so it intercepts the
// request regardless of which origin actually issues it — the demo app's
// own hooks and the onRamp bundle's internal calls may target different
// base URLs depending on how the bundle was built.
export const handlers = [
  http.post(
    '*/provisioning/organizations/:organizationId/connection-invite-tokens',
    async ({ request }) => {
      const body = (await request.json()) as {
        vendor: string;
        options?: Record<string, unknown>;
      };
      if (!MOCKED_VENDORS.includes(body.vendor)) {
        return passthrough();
      }
      const token = encodeMockToken({
        organization_id: MOCK_ORG_ID,
        vendor: body.vendor,
        options: body.options,
      });
      return HttpResponse.json({ token });
    },
  ),

  http.post(
    '*/provisioning/organizations/:organizationId/connection-invite-token/validate',
    async ({ request }) => {
      const body = (await request.json()) as { token: string };
      const mocked = decodeIfMocked(body.token);
      if (!mocked) return passthrough();

      return HttpResponse.json(VENDOR_SCHEMAS[mocked.vendor] as JsonBodyType);
    },
  ),

  http.post(
    '*/provisioning/organizations/:organizationId/connections',
    async ({ request }) => {
      const inviteToken = request.headers.get('x-connection-invite-token');
      const mocked = inviteToken ? decodeIfMocked(inviteToken) : null;
      if (!mocked) return passthrough();

      const body = (await request.json()) as {
        generate_api_credentials?: boolean;
        identifier?: string;
      };

      return HttpResponse.json({
        id: crypto.randomUUID(),
        vendor: mocked.vendor,
        is_active: true,
        refresh_interval_secs: 14400,
        timeout_secs: 3600,
        organization_id: MOCK_ORG_ID,
        oauth2_authorize_url: null,
        identifier: body.identifier ?? null,
        direction: 'SOURCE',
        api_credentials: body.generate_api_credentials
          ? {
              client_id: crypto.randomUUID(),
              secret: `mock_secret_${crypto.randomUUID().slice(0, 8)}`,
            }
          : null,
        // Surfaced here only so the demo can show that pairing landed;
        // the real API never echoes options back on the response.
        _mock_options: mocked.options ?? null,
      });
    },
  ),
];
