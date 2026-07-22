import '@leendev/onramp';

// The published @leendev/onramp@0.0.17 type defs predate onramp PR #50
// (vendorName / generateApiKey props, api_credentials on the response) and
// PR #3's SNOW branding work. The deployed "dev" bundle already supports
// these at runtime; this just lets TypeScript know about them here without
// waiting on a new npm publish.
declare module '@leendev/onramp' {
  interface LeenOnRampProps {
    vendorName?: string;
    generateApiKey?: boolean;
  }

  interface ConnectionResponse {
    api_credentials?: {
      client_id: string;
      secret?: string;
    } | null;
  }
}
