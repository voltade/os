import type { Factory } from './factory.ts';

const createRunTimeRoute = (appName: string, factory: Factory) => {
  return factory.createApp().get('/', (c) => {
    return c.text(
      `
window.__env = window.__env ?? {};
window.__env["${appName}"] = ${JSON.stringify(Object.fromEntries(Object.entries(c.env).filter(([key]) => key.startsWith('VITE_'))), null, 2)};
`.trim(),
      200,
      { 'Content-Type': 'application/javascript' },
    );
  });
};

export default createRunTimeRoute;
