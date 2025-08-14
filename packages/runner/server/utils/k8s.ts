import { getK8sClient, getK8sObjectClient } from '#server/lib/kubeapi.ts';

export async function getCnpgSecret(namespace: string, secretName: string) {
  const k8s = getK8sClient();
  try {
    const secret = await k8s.readNamespacedSecret({
      name: secretName,
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

export type HttpRoute = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
  };
  spec: {
    hostnames: string[];
  };
};

export async function getHttpRouteHostname(
  namespace: string,
  routeName: string,
) {
  const k8s = getK8sObjectClient();
  const route: HttpRoute = await k8s.read({
    apiVersion: 'gateway.networking.k8s.io/v1',
    kind: 'HTTPRoute',
    metadata: {
      name: routeName,
      namespace,
    },
  });
  return route.spec.hostnames[0];
}
