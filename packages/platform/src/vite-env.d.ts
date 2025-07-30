/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL: string;
}

interface Window {
  __env?: {
    VITE_APP_URL?: string;
  };
}
