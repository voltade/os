import '@voltade/ui/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { Toaster } from '@voltade/ui/sonner.tsx';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// import { name } from '../package.json';
import type { RuntimeEnv } from './lib/get-runtime-env.ts';
import reportWebVitals from './reportWebVitals.ts';
// Import the generated route tree
import { routeTree } from './routeTree.gen.ts';

const queryClient = new QueryClient();

const hashHistory = createHashHistory();
const router = createRouter({
  routeTree,
  context: {
    queryClient,
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
    __env: {
      [key: string]: RuntimeEnv;
    };
  }
}

interface Props {
  container?: HTMLElement;
  baseUrl?: string;
}

let root: ReactDOM.Root;

const render = (props?: Props) => {
  const container = props?.container
    ? props.container.querySelector('#app-root')
    : document.getElementById('app-root');
  // biome-ignore lint/style/noNonNullAssertion: false positive
  root = ReactDOM.createRoot(container!);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
};

if (!window.__POWERED_BY_QIANKUN__) {
  render();
  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
}

const name = 'voltade-education-registration';

export async function bootstrap() {
  console.log(`${name} bootstrap`);
}

export async function mount(props: Props) {
  console.log(`${name} mount`, props);
  // Set baseUrl to global so components can access it without props drilling
  if (props?.baseUrl) {
    window.__BASE_URL__ = props.baseUrl;
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
