import { eq } from 'drizzle-orm';

import { orgDomainTable } from '#drizzle/org_domain.ts';
import { orgJoinIdentityTable } from '#drizzle/org_join_identity.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

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
            /* phone_number: {
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
            }, */
          },
          // anyOf: [{ required: ['email'] }, { required: ['phone_number'] }],
          required: ['email'],
          additionalProperties: false,
        },
      },
    });
  })
  .post('/hooks/pre-registration', async (c) => {
    console.log(c.req.method, c.req.url);

    // TODO: Validate the request body against the expected schema
    const body = (await c.req.json()) as {
      identity: { id: string; traits: { email: string } };
    };
    console.log('pre-registration hook body:', body);

    const emailDomain = body.identity.traits.email.split('@')[1].toLowerCase();
    const [orgDomain] = await db
      .select({ org_id: orgDomainTable.org_id })
      .from(orgDomainTable)
      .where(eq(orgDomainTable.domain, emailDomain));

    if (orgDomain) {
      await db
        .insert(orgJoinIdentityTable)
        .values({
          org_id: orgDomain.org_id,
          identity_id: body.identity.id,
        })
        .onConflictDoNothing();
    }

    // https://www.ory.sh/docs/guides/integrate-with-ory-cloud-through-webhooks#update-identity-metadata
    // https://www.ory.sh/docs/kratos/manage-identities/managing-users-identities-metadata#at-a-glance
    return c.json({
      identity: {
        metadata_public: { orgs: orgDomain ? [orgDomain.org_id] : [] },
      },
    });
  })
  .post('/hooks/post-registration', async (c) => {
    console.log(c.req.method, c.req.url);

    // TODO: Validate the request body against the expected schema
    const body = (await c.req.json()) as {
      identity: {
        id: string;
        traits: { email: string };
        metadata_public: { orgs: string[] };
      };
    };
    console.log('post-registration hook body:', body);

    const firstOrg = body.identity.metadata_public.orgs?.[0];
    if (firstOrg) {
      await db
        .insert(orgJoinIdentityTable)
        .values({
          org_id: firstOrg,
          identity_id: body.identity.id,
        })
        .onConflictDoNothing();
    }
    return c.body(null, 204);
  });
