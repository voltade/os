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
