// A deliberately unsigned, JWT-*shaped* token: three dot-separated segments
// so onRamp's own `parseJwt` (base64url-decodes segment[1], no signature
// check) can read `organization_id` out of it, exactly like a real invite
// token. Never do this for anything that isn't a local mock.

function base64UrlEncode(json: unknown): string {
  const base64 = btoa(JSON.stringify(json));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(segment: string): unknown {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export interface MockTokenPayload {
  organization_id: string;
  vendor: string;
  options?: Record<string, unknown>;
}

export function encodeMockToken(payload: MockTokenPayload): string {
  const header = base64UrlEncode({ alg: 'none', typ: 'mock' });
  const body = base64UrlEncode(payload);
  return `${header}.${body}.mock-unsigned`;
}

export function decodeMockToken(token: string): MockTokenPayload {
  return base64UrlDecode(token.split('.')[1]) as MockTokenPayload;
}
