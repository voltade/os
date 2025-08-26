import { $ } from 'bun';
import * as k8s from '@kubernetes/client-node';

export const kc = new k8s.KubeConfig();

if (process.env.NODE_ENV === 'production') {
  kc.loadFromCluster();
} else {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  kc.loadFromDefault();
  const cluster = kc.getCluster('kind-voltade-os-local');
  if (!cluster) {
    throw new Error('Cluster "kind-voltade-os-local" not found in kubeconfig');
  }
  // argocd/platform/platform/base/serviceaccount.yaml
  const token =
    await $`kubectl get secret -n platform platform-token -o jsonpath="{.data.token}" | base64 --decode`.text();
  kc.loadFromClusterAndUser(cluster, {
    name: 'platform',
    token: token.trim(),
  });
}

const k8sClient = kc.makeApiClient(k8s.CustomObjectsApi);
const cnpgCluster = await k8sClient.getNamespacedCustomObjectStatus({
  group: 'postgresql.cnpg.io',
  version: 'v1',
  plural: 'clusters',
  namespace: 'org-tfcd169-t3ru0wqv',
  name: 'cnpg-cluster',
});

console.log('cnpgCluster:', cnpgCluster);
