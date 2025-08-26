import * as k8s from '@kubernetes/client-node';

import { kc } from '#server/lib/k8s.ts';

const k8sClient = kc.makeApiClient(k8s.CustomObjectsApi);

type CnpgCluster = {
  status: {
    instances: number;
    readyInstances: number;
  };
};

export async function getCnpgStatus(namespace: string) {
  const cnpgCluster: CnpgCluster =
    await k8sClient.getNamespacedCustomObjectStatus({
      group: 'postgresql.cnpg.io',
      version: 'v1',
      plural: 'clusters',
      namespace,
      name: 'cnpg-cluster',
    });
  return cnpgCluster.status;
}
