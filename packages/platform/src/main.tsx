import './main.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { SidebarProvider } from '@voltade/ui/sidebar.js';
import { Toaster } from '@voltade/ui/sonner.tsx';
import { ThemeProvider } from '@voltade/ui/theme-provider.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';

import { routeTree } from './routeTree.gen.ts';

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

declare global {
  interface Window {
    toast: typeof toast;
  }
}

window.toast = toast;

// biome-ignore lint/style/noNonNullAssertion: root element is there
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
