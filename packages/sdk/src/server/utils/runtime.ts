import { factory } from './factory.ts';

const createRunTimeRoute = (appName: string) => {
  return factory.createApp().get('/', (c) => {
    return c.text(
      `
window.__env = window.__env ?? {};
window.__env["${appName}"] = {
  VITE_PGREST_URL: '${c.env.VITE_PGREST_URL}',
  VITE_PLATFORM_URL: '${c.env.VITE_PLATFORM_URL}',
};
`.trim(),
      200,
      { 'Content-Type': 'application/javascript' },
    );
  });
};

export default createRunTimeRoute;
