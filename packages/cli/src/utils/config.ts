import yaml from 'js-yaml';
import { z } from 'zod';

export const CONFIG_FILE = '.voltade.yaml';

export const DEFAULT_CONFIG: Config = {
  auth: {
    session_token: '',
    session_expires_at: 0,
  },
};

export const configSchema = z.object({
  auth: z.object({
    session_token: z.string(),
    session_expires_at: z.number(),
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

export async function setAuthData(authData: Config['auth']) {
  await setConfig({ auth: authData });
}

export async function isTokenValid(): Promise<boolean> {
  try {
    const config = await getConfig();
    return (
      config.auth.session_token !== '' &&
      config.auth.session_expires_at > Date.now()
    );
  } catch {
    return false;
  }
}

export async function clearAuth() {
  await setConfig({ auth: DEFAULT_CONFIG.auth });
}
