import { Configuration, FrontendApi } from '@ory/client-fetch';
import type { OryClientConfiguration } from '@ory/elements-react';

export const ory = new FrontendApi(
  new Configuration({
    basePath: import.meta.env.VITE_KRATOS_HOST,
    credentials: 'include',
    headers: {
      accept: 'application/json',
    },
  }),
);

export const config: OryClientConfiguration = {
  sdk: { url: import.meta.env.VITE_KRATOS_HOST },
  project: {
    name: 'Voltade OS',
    default_locale: 'en',
    default_redirect_url: '/',
  },
};
