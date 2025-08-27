import { appEnvVariablesSchema as sdkAppEnvVariablesSchema } from '@voltade/sdk';
import type { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = sdkAppEnvVariablesSchema.extend({});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
