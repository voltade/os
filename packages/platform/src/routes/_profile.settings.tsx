import { Button, Group, Stack } from '@mantine/core';
import {
  Configuration,
  FrontendApi,
  type SettingsFlow,
} from '@ory/client-fetch';
import { Settings } from '@ory/elements-react/theme';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { config, ory } from '#src/lib/ory.ts';

const frontend = new FrontendApi(
  new Configuration({
    basePath: import.meta.env.VITE_KRATOS_HOST,
    credentials: 'include',
  }),
);

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
      <Group>
        <Button
          onClick={async () => {
            const session = await frontend.toSession({
              tokenizeAs: 'postgrest',
            });
            console.log(session.tokenized);
          }}
        >
          JWT
        </Button>
      </Group>
      <Settings flow={flow} config={config} />
    </Stack>
  );
}
