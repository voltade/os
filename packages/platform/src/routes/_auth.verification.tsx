import { Stack } from '@mantine/core';
import type { VerificationFlow } from '@ory/client-fetch';
import { Verification } from '@ory/elements-react/theme';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { config, ory } from '#src/lib/ory.ts';

export const Route = createFileRoute('/_auth/verification')({
  component: RouteComponent,
});

function RouteComponent() {
  const [flow, setFlow] = useState<VerificationFlow>();
  useEffect(() => {
    (async () => {
      const flow = await ory.createBrowserVerificationFlow();
      setFlow(flow);
    })();
  }, []);
  if (!flow) {
    return null;
  }
  return (
    <Stack py="lg">
      <Verification flow={flow} config={config} />
    </Stack>
  );
}
