import z from 'zod';

const ConfigFileName = 'voltade.json';

export const configSchema = z.object({
  baseUrl: z.url(),
  organizationId: z.string().optional(),
  environmentId: z.string().optional(),
});
