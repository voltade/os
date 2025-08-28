import { env } from '@voltade/sdk/server';

//TODO: this is a work in progress
export const inviteGuestToOrganisation = async (userId: string) => {
  const res = await fetch(`${env.PLATFORM_URL}/api/organization/guest`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.RUNNER_KEY}`,
    },
    body: JSON.stringify({
      organizationId: env.ORGANIZATION_ID,
      userId,
    }),
  });
};
