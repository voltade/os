import '@mantine/core/styles.css';
import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';
import './main.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import type { Database } from '#src/database.gen.ts';
import theme from '#src/theme.ts';
import type { RuntimeEnv } from '#utils/get-runtime-env.ts';
import { name } from '../package.json';
import * as TanstackQuery from './integrations/tanstack-query/root-provider.tsx';
import reportWebVitals from './reportWebVitals.ts';
// Import the generated route tree
import { routeTree } from './routeTree.gen.ts';

// Create a new router instance
const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  history: hashHistory,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __BASE_URL__?: string;
    supabaseClient: SupabaseClient<Database>;
    __env: {
      [key: string]: RuntimeEnv;
    };
  }
}

interface Props {
  container?: HTMLElement;
  baseUrl?: string;
  supabaseClient?: SupabaseClient<Database>;
}

let root: ReactDOM.Root;

const render = (props?: Props) => {
  const container = props?.container
    ? props.container.querySelector('#root')
    : document.getElementById('root');
  // biome-ignore lint/style/noNonNullAssertion: false positive
  root = ReactDOM.createRoot(container!);
  root.render(
    <StrictMode>
      <MantineProvider theme={theme}>
        <TanstackQuery.Provider>
          <ModalsProvider>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />

            <Notifications position="top-right" limit={5} />
          </ModalsProvider>
        </TanstackQuery.Provider>
      </MantineProvider>
    </StrictMode>,
  );
};

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log(`${name} bootstrap`);
}

export async function mount(props: Props) {
  console.log(`${name} mount`, props);
  // Set baseUrl to global so components can access it without props drilling
  if (props?.baseUrl) {
    window.__BASE_URL__ = props.baseUrl;
  }
  // Set supabaseClient to global so components can access it without props drilling
  if (props?.supabaseClient) {
    window.supabaseClient = props.supabaseClient;
  }
  render(props);
}

export async function unmount(props: Props) {
  console.log(`${name} unmount`, props);
  root.unmount();
}

export async function update(props: Props) {
  console.log(`${name} update`, props);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
