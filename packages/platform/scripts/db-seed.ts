import { hashPassword } from 'better-auth/crypto';

import { appTable } from '#drizzle/app.ts';
import { account as accountTable, user as userTable } from '#drizzle/auth.ts';
import { environmentTable } from '#drizzle/index.ts';
import { auth } from '#server/lib/auth';
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

let organizationId: string;

try {
  await auth.api.checkOrganizationSlug({
    headers,
    body: {
      slug: 'admin-org',
    },
  });
  console.log('Organization not found, creating...');
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

  organizationId = organization.id;
} catch {
  console.log('Organization already exists, skipping...');

  const organization = await auth.api.getFullOrganization({
    headers,
    query: {
      organizationSlug: 'voltade',
    },
  });

  if (!organization) {
    throw new Error('Failed to get organization');
  }

  organizationId = organization.id;
}

await db.transaction(async (tx) => {
  await tx
    .insert(environmentTable)
    .values({
      organization_id: organizationId,
      is_production: true,
      slug: 'main',
      name: 'Main',
    })
    .onConflictDoNothing();
});

await db.transaction(async (tx) => {
  await tx
    .insert(appTable)
    .values({
      organization_id: organizationId,
      name: 'Test App',
      slug: 'test-app',
      description: 'Test App',
      git_repo_url: 'file://mnt/voltade-os.git',
      git_repo_path: 'packages/app-template',
      git_repo_branch: 'main',
    })
    .onConflictDoNothing();
});

console.log('Database seeded successfully!');
