import { factory } from '#server/factory.ts';
import packageJson from '../../package.json';

const route = factory.createApp().get('/', (c) => {
  return c.text(
    `
window.__env = window.__env ?? {};
window.__env["${packageJson.name}"] = {
  VITE_APP_URL: '${c.env.VITE_APP_URL}',
};
`.trim(),
    200,
    { 'Content-Type': 'application/javascript' },
  );
});

export default route;
