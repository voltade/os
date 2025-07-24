import { factory } from '#server/factory.ts';

export const route = factory
  .createApp()
  .get('/identity.email.schema.json', async (c) => {
    console.log(c.req.method, c.req.url);
    // https://www.ory.sh/docs/kratos/manage-identities/customize-identity-schema
    return c.json({
      $id: 'https://schemas.ory.sh/presets/kratos/identity.email.schema.json',
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Person',
      type: 'object',
      properties: {
        traits: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              title: 'E-Mail',
              'ory.sh/kratos': {
                credentials: {
                  code: {
                    identifier: true,
                    via: 'email',
                  },
                },
                recovery: {
                  via: 'email',
                },
                verification: {
                  via: 'email',
                },
              },
            },
            phone_number: {
              type: 'string',
              format: 'tel',
              title: 'Your phone number',
              'ory.sh/kratos': {
                credentials: {
                  code: {
                    identifier: true,
                    via: 'sms',
                  },
                },
              },
            },
          },
          anyOf: [{ required: ['email'] }, { required: ['phone_number'] }],
          additionalProperties: false,
        },
      },
    });
  });
