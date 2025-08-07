import yaml from 'js-yaml';
import { z } from 'zod';

export const CONFIG_FILE = '.voltade.yaml';

export const DEFAULT_CONFIG: Config = {
  auth: {
    access_token: '',
    expires_in: 0,
    expires_at: 0,
    id_token: '',
  },
};

export const configSchema = z.object({
  auth: z.object({
    access_token: z.string(),
    expires_in: z.number(),
    expires_at: z.number(),
    id_token: z.string(),
  }),
});

export const partialConfigSchema = configSchema.partial();
export type Config = z.infer<typeof configSchema>;
export type PartialConfig = z.infer<typeof partialConfigSchema>;

export async function getConfig() {
  try {
    const config = await Bun.file(CONFIG_FILE).text();
    const parsedConfig = yaml.load(config) as Config;
    return configSchema.parse(parsedConfig);
  } catch (error) {
    console.error('Error loading config file:', error);
    return DEFAULT_CONFIG;
  }
}

export async function setConfig(config: PartialConfig) {
  const validatedConfig = partialConfigSchema.parse(config);
  await Bun.write(CONFIG_FILE, yaml.dump(validatedConfig));
}

export async function setAuthData(authData: {
  access_token: string;
  expires_in: number;
  expires_at: number;
  id_token: string;
}) {
  await setConfig({ auth: authData });
}

export async function isTokenValid(): Promise<boolean> {
  try {
    const config = await getConfig();
    return (
      config.auth.access_token !== '' && config.auth.expires_at > Date.now()
    );
  } catch {
    return false;
  }
}

export async function clearAuth() {
  await setConfig({ auth: DEFAULT_CONFIG.auth });
}
