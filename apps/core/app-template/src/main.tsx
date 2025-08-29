import '@voltade/ui/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { reportWebVitals } from '@voltade/sdk/client';
import { Toaster } from '@voltade/ui/sonner.tsx';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

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
        {import.meta.env.DEV && <Toaster position="top-right" richColors />}
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

export async function bootstrap() {}

export async function mount(props: Props) {
  // Set baseUrl to global so components can access it without props drilling
  if (props?.baseUrl) {
    window.__BASE_URL__ = props.baseUrl;
  }
  render(props);
}

export async function unmount(_props: Props) {
  root.unmount();
}

export async function update(_props: Props) {}
