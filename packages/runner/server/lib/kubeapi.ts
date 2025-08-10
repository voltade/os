import * as k8s from '@kubernetes/client-node';

export function getK8sClient() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const kc = new k8s.KubeConfig();

  kc.loadFromCluster();

  return kc.makeApiClient(k8s.CoreV1Api);
}

export function getK8sObjectClient() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const kc = new k8s.KubeConfig();

  kc.loadFromCluster();

  return k8s.KubernetesObjectApi.makeApiClient(kc);
}
