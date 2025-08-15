import { appEnvVariables } from '#server/env.ts';
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
      name: appEnvVariables.CLUSTER_NAME,
      server: appEnvVariables.CLUSTER_SERVER,
      skipTLSVerify: appEnvVariables.CLUSTER_SKIP_TLS_VERIFY,
      caData: appEnvVariables.CLUSTER_CA_DATA,
    },
    user: {
      name: appEnvVariables.USER_NAME,
      token: appEnvVariables.USER_TOKEN,
    },
    context: {
      name: 'default',
      cluster: appEnvVariables.CLUSTER_NAME,
      user: appEnvVariables.USER_NAME,
    },
  } as const;

  const k8sClient = getK8sObjectClient({
    env:
      appEnvVariables.NODE_ENV === 'development' ? 'development' : 'production',
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
