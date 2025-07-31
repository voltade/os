import * as k8s from '@kubernetes/client-node';

export type K8sConfig = {
  cluster: k8s.KubeConfig['clusters'][number];
  user: k8s.KubeConfig['users'][number];
  context: k8s.KubeConfig['contexts'][number];
};

type K8sClientOptions =
  | {
      env: 'production' | 'staging';
      config?: K8sConfig;
    }
  | {
      env: 'development';
      config: K8sConfig;
    };

export function getK8sClient(options: K8sClientOptions) {
  const { env, config } = options;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const kc = new k8s.KubeConfig();

  if (env === 'development') {
    kc.loadFromOptions({
      clusters: [config.cluster],
      users: [config.user],
      contexts: [config.context],
      currentContext: config.context.name,
    });
  } else {
    kc.loadFromCluster();
  }

  return kc.makeApiClient(k8s.CoreV1Api);
}

export function getK8sObjectClient(options: K8sClientOptions) {
  const { env, config } = options;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const kc = new k8s.KubeConfig();

  if (env === 'development') {
    kc.loadFromOptions({
      clusters: [config.cluster],
      users: [config.user],
      contexts: [config.context],
      currentContext: config.context.name,
    });
  } else {
    kc.loadFromCluster();
  }

  return k8s.KubernetesObjectApi.makeApiClient(kc);
}
