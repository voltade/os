import { Login } from '@ory/elements-react/theme';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { ory } from '#src/lib/ory.ts';

const authSearchSchema = z.object({
  flow: z.string().optional(),
});

export const Route = createFileRoute('/_auth/login')({
  validateSearch: zodValidator(authSearchSchema),
  loaderDeps: ({ search: { flow } }) => ({ flowId: flow }),
  loader: async ({ deps: { flowId } }) => {
    const browserUrl = `${import.meta.env.VITE_KRATOS_HOST}/self-service/login/browser`;
    if (!flowId) {
      window.location.href = browserUrl;
      return;
    }
    try {
      const flow = await ory.getLoginFlow({ id: flowId });
      return flow;
    } catch (error) {
      console.error(error);
      window.location.href = browserUrl;
      return null;
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const flow = Route.useLoaderData();

  if (!flow) {
    return null;
  }

  return (
    <Login
      flow={flow}
      config={{
        sdk: {
          url: import.meta.env.VITE_KRATOS_HOST,
        },
        project: { name: 'Voltade OS' },
      }}
    />
  );
}
