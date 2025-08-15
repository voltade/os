import z from 'zod';

const ConfigFileName = 'voltade.json';

export const configSchema = z.object({
  organizationId: z.string().optional(),
  environmentId: z.string().optional(),
});
