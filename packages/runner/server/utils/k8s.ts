import { getK8sClient } from '#server/lib/kubeapi.ts';

export async function getCnpgSecret(namespace: string) {
  const k8s = getK8sClient();
  try {
    const secret = await k8s.readNamespacedSecret({
      name: 'cnpg-cluster-app',
      namespace,
    });

    // Base64 decode username and password fields
    const username = secret.data?.username
      ? Buffer.from(secret.data.username, 'base64').toString('utf-8')
      : undefined;
    const password = secret.data?.password
      ? Buffer.from(secret.data.password, 'base64').toString('utf-8')
      : undefined;

    return {
      username,
      password,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
