import { platformEnvVariables } from '#server/env.ts';
import { getK8sObjectClient } from './kubeapi.ts';

type CnpgCluster = {
  status: {
    instances: number;
    readyInstances: number;
  };
};

export async function checkCnpgHealth(namespace: string) {
  const k8sConfig = {
    cluster: {
      name: platformEnvVariables.CLUSTER_NAME,
      server: platformEnvVariables.CLUSTER_SERVER,
      skipTLSVerify: platformEnvVariables.CLUSTER_SKIP_TLS_VERIFY,
      caData: platformEnvVariables.CLUSTER_CA_DATA,
    },
    user: {
      name: platformEnvVariables.USER_NAME,
      token: platformEnvVariables.USER_TOKEN,
    },
    context: {
      name: 'default',
      cluster: platformEnvVariables.CLUSTER_NAME,
      user: platformEnvVariables.USER_NAME,
    },
  } as const;

  const k8sClient = getK8sObjectClient({
    env:
      platformEnvVariables.NODE_ENV === 'development'
        ? 'development'
        : 'production',
    config: k8sConfig,
  });

  const cnpgCluster = (await k8sClient.read({
    apiVersion: 'postgresql.cnpg.io/v1',
    kind: 'Cluster',
    metadata: {
      name: 'cnpg-cluster',
      namespace,
    },
  })) as CnpgCluster;

  return {
    instances: cnpgCluster.status.instances,
    readyInstances: cnpgCluster.status.readyInstances,
  };
}
