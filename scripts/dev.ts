import { $ } from 'bun';

(async () => {
  await Promise.all([$`bun run dev:server`, $`bun run dev:vite`]);
})();
