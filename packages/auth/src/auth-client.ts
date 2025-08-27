import {
  emailOTPClient,
  inferAdditionalFields,
  oidcClient,
  organizationClient,
} from 'better-auth/client/plugins';
import { jwt } from 'better-auth/plugins';
import { createAuthClient as createBetterAuthClient } from 'better-auth/react';

export const createAuthClient = (platformUrl: string) => {
  return createBetterAuthClient({
    baseURL: `${platformUrl}/api/auth`,
    plugins: [
      emailOTPClient(),
      organizationClient(),
      jwt(),
      oidcClient(),
      inferAdditionalFields({
        user: {
          phone: { type: 'string' },
        },
      }),
    ],
  });
};
