import { api } from './api.ts';

interface Environment {
  id: string;
  slug: string;
  name: string | null;
  organization_id: string;
  is_production: boolean;
  created_at: string;
  updated_at: string;
}

export async function getEnvironments(orgId: string) {
  try {
    const response = await api.environment.$get({
      query: { orgId },
    });

    if (!response.ok) {
      console.log('response', await response.json());
      throw new Error(`Failed to fetch environments: ${response.status}`);
    }

    const environments: Environment[] = await response.json();

    // Transform to match existing CLI interface
    return environments.map((env) => ({
      name: `org-${env.organization_id}-${env.id}`,
      namespace: `org-${env.organization_id}-${env.id}`,
      org: env.organization_id,
      env: env.slug,
      id: env.id,
      slug: env.slug,
      isProduction: env.is_production,
    }));
  } catch (error) {
    console.error('Error fetching environments from platform:', error);
    throw error;
  }
}

export async function getDetails(environmentSlug: string) {
  try {
    const response = await api.environment[':environmentSlug'].$get({
      param: { environmentSlug },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch environment details: ${response.status}`,
      );
    }

    const environment: Environment = await response.json();

    return {
      configuration: null, // Configuration not available via this API endpoint
      name: `org-${environment.organization_id}-${environment.id}`,
      labels: {
        'voltade.io/environment': environment.slug,
        'voltade.io/organization': environment.organization_id,
        'voltade.io/production': environment.is_production.toString(),
      },
      status: 'Healthy', // Status not available via this API endpoint
      environment,
    };
  } catch (error) {
    console.error('Error fetching environment details from platform:', error);
    throw error;
  }
}
