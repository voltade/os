import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { $ } from 'bun';

(async () => {
  const user_token =
    await $`kubectl create token os-service-account -n voltade-os`.text();
  console.log('Generated USER_TOKEN');

  const cluster_server =
    await $`kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'`.text();
  console.log('Retrieved CLUSTER_SERVER');

  const cluster_ca_data =
    await $`kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}'`.text();
  console.log('Retrieved CLUSTER_CA_DATA');

  // Path to .env.development
  const envPath = join(process.cwd(), '.env');

  try {
    // Try to read existing file
    let envContent = await readFile(envPath, 'utf-8').catch(() => '');

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

    // Write the updated content back to the file
    await writeFile(envPath, envContent);
    console.log('.env.local updated successfully');
  } catch (error) {
    console.error('Error updating .env.local:', error);
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
