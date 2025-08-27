import type { AppEnvVariables } from '#server/zod/env.ts';

export type Variables = Record<string, unknown> & AppEnvVariables;
