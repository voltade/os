import { Registration } from '@ory/elements-react/theme';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { config, ory } from '#src/lib/ory.ts';

const authSearchSchema = z.object({
  flow: z.string().optional(),
});

export const Route = createFileRoute('/_auth/registration')({
  validateSearch: zodValidator(authSearchSchema),
  loaderDeps: ({ search: { flow } }) => ({ flowId: flow }),
  loader: async ({ deps: { flowId } }) => {
    const browserUrl = `${import.meta.env.VITE_KRATOS_HOST}/self-service/registration/browser`;
    if (!flowId) {
      window.location.href = browserUrl;
      return;
    }
    try {
      const flow = await ory.getRegistrationFlow({ id: flowId });
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

  return <Registration flow={flow} config={config} />;
}
