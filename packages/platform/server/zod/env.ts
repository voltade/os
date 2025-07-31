import { z } from 'zod';

export const appEnvVariablesSchema = z.object({
  // Frontend
  VITE_APP_URL: z.url(),

  // BetterAuth
  AUTH_SECRET: z.string(),

  NODE_ENV: z.enum(['development', 'production']).default('development'),

  // Postgres
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.preprocess((v) => Number(v), z.number()),
  DB_NAME: z.string(),

  // Local Kubernetes
  CLUSTER_NAME: z.string().optional().default(''),
  CLUSTER_SERVER: z.string().optional().default(''),
  CLUSTER_CA_DATA: z.string().optional().default(''),
  CLUSTER_SKIP_TLS_VERIFY: z
    .preprocess((v) => v === 'true', z.boolean())
    .default(false),

  USER_NAME: z.string().optional().default(''),
  USER_TOKEN: z.string().optional().default(''),

  // ArgoCD
  ARGOCD_ENVIRONMENT_GENERATOR_TOKEN: z.string(),

  // Runner Communication
  RUNNER_SECRET_TOKEN: z.string(),

  JWKS_PRIVATE_BASE64: z.string(),
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
