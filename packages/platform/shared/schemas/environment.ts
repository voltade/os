import { z } from 'zod';

export const createEnvironmentSchema = z.object({
  slug: z.string().min(3),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_production: z.boolean().default(false),
  runner_count: z.coerce.number().int().positive().default(1),
  database_instance_count: z.coerce.number().int().positive().default(1),
});

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
