import { Stack } from '@mantine/core';
import type { RecoveryFlow } from '@ory/client-fetch';
import { Recovery } from '@ory/elements-react/theme';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { config, ory } from '#src/lib/ory.ts';
export const Route = createFileRoute('/_auth/recovery')({
  component: RouteComponent,
});

function RouteComponent() {
  const [flow, setFlow] = useState<RecoveryFlow>();
  useEffect(() => {
    (async () => {
      const flow = await ory.createBrowserRecoveryFlow();
      setFlow(flow);
    })();
  }, []);
  if (!flow) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Recovery flow={flow} config={config} />
    </Stack>
  );
}
