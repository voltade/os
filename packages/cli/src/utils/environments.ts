import { $ } from 'bun';
import * as yaml from 'js-yaml';

interface Application {
  metadata: {
    name: string;
    labels: Record<string, string>;
  };
  spec: {
    destination: {
      namespace: string;
    };
    source: {
      helm: {
        values: string;
      };
    };
  };
  status: {
    health: {
      status: string;
    };
  };
}

interface ApplicationList {
  items: Application[];
}

export async function getEnvironments() {
  const stdout = await $`kubectl get applications -n argocd -o json`.text();
  const applicationList: ApplicationList = JSON.parse(stdout);

  const environments = applicationList.items
    .filter((app) => app.metadata.name.startsWith('org-'))
    .map((app) => {
      const name = app.metadata.name;
      const namespace = app.spec.destination.namespace;
      const [_, org, env] = name.split('-');
      return {
        name,
        namespace,
        org,
        env,
      };
    });

  return environments;
}

export async function getDetails(environment: string) {
  const stdout =
    await $`kubectl get applications ${environment} -n argocd -o json`.text();
  const details: Application = JSON.parse(stdout);

  const configuration = yaml.load(details.spec.source.helm.values);

  return {
    configuration,
    name: details.metadata.name,
    labels: details.metadata.labels,
    status: details.status.health.status,
  };
}
