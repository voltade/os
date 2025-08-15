import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { $ } from 'bun';

(async () => {
  const user_name = 'platform';
  const namespace = 'platform';

  const user_token =
    await $`kubectl create token ${user_name} -n ${namespace} --duration=10h`.text();
  console.log('Generated USER_TOKEN');

  const cluster_server =
    await $`kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'`.text();
  console.log('Retrieved CLUSTER_SERVER');

  const cluster_ca_data =
    await $`kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}'`.text();
  console.log('Retrieved CLUSTER_CA_DATA');

  const db_password =
    await $`kubectl get secret -n platform cnpg-platform-admin -o jsonpath="{.data.password}" | base64 -d`.text();
  console.log('Retrieved DB_PASSWORD');

  const runner_token =
    await $`kubectl get secret -n platform shared-secrets -o jsonpath="{.data.runnerSecretToken}" | base64 -d`.text();
  console.log('Retrieved RUNNER_SECRET_TOKEN');

  const proxy_token =
    await $`kubectl get secret -n platform shared-secrets -o jsonpath="{.data.proxySecretToken}" | base64 -d`.text();
  console.log('Retrieved PROXY_SECRET_TOKEN');

  const s3_secret_key =
    await $`kubectl get secret -n minio minio -o jsonpath="{.data.root-password}" | base64 -d`.text();
  console.log('Retrieved S3_SECRET_KEY');

  const argocd_secret_key_b64 = (
    await $`kubectl get secret -n argocd argocd-extra-secret -o json`.json()
  ).data['environment-generator.token'];
  const argocd_secret_key = Buffer.from(
    argocd_secret_key_b64,
    'base64',
  ).toString('utf-8');
  console.log('Retrieved ARGOCD_SECRET_KEY');

  // Path to .env and .env.example
  const envPath = join(process.cwd(), '.env');
  const envExamplePath = join(process.cwd(), '.env.example');

  try {
    // If .env doesn't exist, copy from .env.example
    try {
      await readFile(envPath);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        await copyFile(envExamplePath, envPath);
        console.log('.env created from .env.example');
      } else {
        throw error;
      }
    }

    // Read existing file
    let envContent = await readFile(envPath, 'utf-8');

    // Update or add the tokens
    envContent = updateEnvVar(envContent, 'USER_TOKEN', user_token.trim());

    // Add cluster configuration from kubectl
    envContent = updateEnvVar(
      envContent,
      'CLUSTER_SERVER',
      cluster_server.trim(),
    );

    envContent = updateEnvVar(
      envContent,
      'CLUSTER_CA_DATA',
      cluster_ca_data.trim(),
    );

    envContent = updateEnvVar(envContent, 'DB_PASSWORD', db_password.trim());

    envContent = updateEnvVar(
      envContent,
      'RUNNER_SECRET_TOKEN',
      runner_token.trim(),
    );

    envContent = updateEnvVar(
      envContent,
      'AWS_SECRET_ACCESS_KEY',
      s3_secret_key.trim(),
    );

    envContent = updateEnvVar(
      envContent,
      'ARGOCD_ENVIRONMENT_GENERATOR_TOKEN',
      argocd_secret_key.trim(),
    );

    envContent = updateEnvVar(
      envContent,
      'PROXY_SECRET_TOKEN',
      proxy_token.trim(),
    );

    // Write the updated content back to the file
    await writeFile(envPath, envContent);
    console.log('.env updated successfully');
  } catch (error) {
    console.error('Error updating .env:', error);
  }
})();

/**
 * Updates or adds an environment variable in the content
 */
function updateEnvVar(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*`, 'm');
  const newLine = `${key}=${value}`;

  if (regex.test(content)) {
    // Update existing variable
    return content.replace(regex, newLine);
  } else {
    // Add new variable
    return `${content + (content.endsWith('\n') ? '' : '\n') + newLine}\n`;
  }
}
