// JsonForms-shaped credential schema for the one mocked vendor, matching
// the real shape served by Leen's onRamp validate-token endpoint (see
// leen_api/vendor-schema.json for the convention this mirrors).

export const LOGO_BASE = 'https://api.leen.dev/static/img/vendor-logos';

// The vendor tile list itself still comes from the real GET /connectors —
// only this vendor's invite-token/validate/create calls are mocked.
export const VENDOR_SCHEMAS: Record<string, unknown> = {
  PROCESSUNITY: {
    vendor: 'PROCESSUNITY',
    vendorName: 'ProcessUnity',
    logoUrl: `${LOGO_BASE}/processunity.png`,
    docsUrl: 'https://docs.leen.dev/integrations/processunity-credential',
    credentialsType: 'SECRETS',
    dataSchema: {
      type: 'object',
      properties: {
        base_url: {
          type: 'string',
          description: 'Your ProcessUnity instance URL',
        },
        username: {
          type: 'string',
          description: 'API user username',
        },
        password: {
          type: 'string',
          password: true,
          description: 'API user password',
        },
        third_party_import_template_id: {
          type: 'integer',
          description: 'Third Party Import Template ID',
        },
        issues_import_template_id: {
          type: 'integer',
          description: 'Issues Import Template ID',
        },
      },
      required: [
        'base_url',
        'username',
        'password',
        'third_party_import_template_id',
        'issues_import_template_id',
      ],
    },
    uiSchema: {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/base_url' },
        { type: 'Control', scope: '#/properties/username' },
        { type: 'Control', scope: '#/properties/password' },
        { type: 'Control', scope: '#/properties/third_party_import_template_id' },
        { type: 'Control', scope: '#/properties/issues_import_template_id' },
      ],
    },
  },
};
