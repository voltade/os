import { sql } from 'drizzle-orm';

import { db } from './db.ts';

export const Vault = {
  create: createSecret,
  get: getSecret,
  getMany: getManySecrets,
  update: updateSecret,
  delete: deleteSecret,
};

/**
 * Creates a new secret in Supabase vault
 * @param secret - The secret value to store
 * @returns The secret ID
 */
async function createSecret(secret: string): Promise<string> {
  const insertResult: Record<string, string>[] = await db.execute(
    sql`select vault.create_secret(${secret})`,
  );

  if (insertResult.length === 0 || !insertResult[0]?.create_secret) {
    throw new Error('Could not insert secret into vault');
  }

  return insertResult[0].create_secret;
}

/**
 * Retrieves a decrypted secret from Supabase vault
 * @param secretId - The ID of the secret to retrieve
 * @returns The decrypted secret value
 */
async function getSecret(secretId: string): Promise<string> {
  if (!secretId) throw new Error('Secret ID is required');

  return await db.transaction(async (tx) => {
    // https://github.com/supabase/vault/issues/27
    await tx.execute(sql`set time zone 'utc'`);

    const decryptedSecrets = (await tx.execute(
      sql`select decrypted_secret from vault.decrypted_secrets where id = ${secretId}`,
    )) as { decrypted_secret: string }[];

    if (decryptedSecrets.length === 0) {
      throw new Error('Could not get decrypted secret');
    }

    const secretResult = decryptedSecrets[0]?.decrypted_secret;
    if (!secretResult) {
      throw new Error('Secret is undefined');
    }

    return secretResult;
  });
}

async function getManySecrets(
  secretIds: string[],
): Promise<Record<string, string>> {
  if (secretIds.length === 0) {
    return {};
  }

  const decryptedSecrets = (await db.execute(
    sql`select id, decrypted_secret from vault.decrypted_secrets where id in (${sql.join(secretIds, sql`, `)})`,
  )) as { id: string; decrypted_secret: string }[];

  console.log(decryptedSecrets);
  if (decryptedSecrets.length === 0) {
    throw new Error('Could not get decrypted secrets');
  }

  return decryptedSecrets.reduce(
    (acc, secret) => {
      acc[secret.id] = secret.decrypted_secret;
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Updates an existing secret in Supabase vault
 * @param secretId - The ID of the secret to update
 * @param newSecret - The new secret value
 * @returns The secret ID
 */
async function updateSecret(
  secretId: string,
  newSecret: string,
): Promise<string> {
  const updateResult = await db.execute(
    sql`select vault.update_secret(${secretId}, ${newSecret})`,
  );

  if (updateResult.length === 0) {
    throw new Error('Could not update secret in vault');
  }

  return secretId;
}

/**
 * Deletes a secret from Supabase vault
 * @param secretId - The ID of the secret to delete
 */
async function deleteSecret(secretId: string): Promise<void> {
  await db.execute(sql`delete from vault.secrets where id = ${secretId}`);
}
