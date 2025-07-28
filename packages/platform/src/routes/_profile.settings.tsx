import { Stack } from '@mantine/core';
import type { SettingsFlow } from '@ory/client-fetch';
import { Settings } from '@ory/elements-react/theme';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { config, ory } from '#src/lib/ory.ts';

export const Route = createFileRoute('/_profile/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const [flow, setFlow] = useState<SettingsFlow>();
  useEffect(() => {
    (async () => {
      const flow = await ory.createBrowserSettingsFlow();
      setFlow(flow);
    })();
  }, []);
  if (!flow) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Settings flow={flow} config={config} />
    </Stack>
  );
}
