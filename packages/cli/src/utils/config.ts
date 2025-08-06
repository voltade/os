import yaml from 'js-yaml';

export type Config = {
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
};
export async function getConfig() {
  const test = await Bun.file('.voltade.yaml').text();
  return yaml.load(test) as Config;
}
