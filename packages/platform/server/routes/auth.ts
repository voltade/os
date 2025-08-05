import { cors } from 'hono/cors';

import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { auth, authMiddleware } from '#server/lib/auth.ts';

// Security middleware to validate user profile updates
const userUpdateSecurityMiddleware = factory.createMiddleware(
  async (c, next) => {
    // Only apply to POST requests to user update endpoints
    if (c.req.method === 'POST' && c.req.url.includes('/update-user')) {
      try {
        const session = c.get('session');
        const user = c.get('user');

        if (!session || !user) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        // Clone the request to read the body (since body can only be read once)
        const requestClone = c.req.raw.clone();
        const body = await requestClone.text();
        const requestData = JSON.parse(body);

        // Define allowed fields for regular users
        const allowedFields = ['name', 'image'];
        const protectedFields = [
          'role',
          'banned',
          'banReason',
          'banExpires',
          'emailVerified',
          'email',
          'id',
          'createdAt',
          'updatedAt',
        ];

        // Check if user is trying to update protected fields
        const requestedFields = Object.keys(requestData);
        const attemptingProtectedFields = requestedFields.some((field) =>
          protectedFields.includes(field),
        );

        // Check if user is trying to update fields not in whitelist
        const attemptingDisallowedFields = requestedFields.some(
          (field) => !allowedFields.includes(field),
        );

        // Block if trying to update protected or non-whitelisted fields (unless admin)
        if (
          (attemptingProtectedFields || attemptingDisallowedFields) &&
          user.role !== 'admin'
        ) {
          console.warn(
            `User ${user.id} attempted to update protected fields:`,
            requestedFields,
          );
          return c.json(
            {
              error: 'Forbidden: Cannot update protected user fields',
              allowedFields: allowedFields,
            },
            403,
          );
        }
      } catch (error) {
        console.error('Error in userUpdateSecurityMiddleware:', error);
        return c.json({ error: 'Invalid request data' }, 400);
      }
    }

    return next();
  },
);

export const route = factory
  .createApp()
  // https://www.better-auth.com/docs/integrations/hono#cors
  .use(
    cors({
      origin: appEnvVariables.VITE_APP_URL, // replace with your origin
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use(authMiddleware())
  .use(userUpdateSecurityMiddleware)
  .on(['POST', 'GET'], '/*', (c) => {
    return auth.handler(c.req.raw);
  });
