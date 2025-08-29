import type { Factory } from 'hono/factory';

export const createRunTimeRoute = <T extends Record<string, unknown>>(
  appName: string,
  factory: Factory<T>,
) => {
  return factory.createApp().get('/', (c) => {
    return c.text(
      `
window.__env = window.__env ?? {};
window.__env["${appName}"] = ${JSON.stringify(Object.fromEntries(Object.entries(c.env as Record<string, unknown>).filter(([key]) => key.startsWith('VITE_'))), null, 2)};
`.trim(),
      200,
      { 'Content-Type': 'application/javascript' },
    );
  });
};
