import { hashPassword } from 'better-auth/crypto';

import { appTable } from '#drizzle/app.ts';
import { account as accountTable, user as userTable } from '#drizzle/auth.ts';
import { environmentTable } from '#drizzle/environment.ts';
import { auth } from '#server/lib/auth.ts';
import { db } from '#server/lib/db.ts';

await db.transaction(async (tx) => {
  await tx
    .insert(userTable)
    .values({
      id: 'admin',
      name: 'Admin',
      email: 'admin@voltade.com',
      emailVerified: true,
    })
    .onConflictDoNothing();
  await tx
    .insert(accountTable)
    .values({
      id: 'admin',
      accountId: 'admin',
      userId: 'admin',
      providerId: 'credential',
      password: await hashPassword('password'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();
});

const res = await auth.api.signInEmail({
  body: {
    email: 'admin@voltade.com',
    password: 'password',
  },
});
const headers = new Headers({ Authorization: `Bearer ${res.token}` });

// Trigger the generation of JWKS
await auth.api.getToken({ headers });

const organization = await auth.api.createOrganization({
  headers,
  body: {
    name: 'Voltade',
    slug: 'voltade',
  },
});
if (!organization) {
  throw new Error('Failed to create organization');
}

await db.transaction(async (tx) => {
  await tx.insert(environmentTable).values({
    organization_id: organization.id,
    is_production: true,
    slug: 'main',
    name: 'Main',
  });
});

await db.transaction(async (tx) => {
  await tx.insert(appTable).values({
    organization_id: organization.id,
    name: 'Test App',
    slug: 'test-app',
    description: 'Test App',
    git_repo_url: 'file://mnt/voltade-os.git',
    git_repo_path: 'packages/app-template',
    git_repo_branch: 'main',
  });
});
