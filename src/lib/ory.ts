import { Configuration, FrontendApi } from '@ory/client-fetch';

export const ory = new FrontendApi(
  new Configuration({
    basePath: import.meta.env.VITE_KRATOS_HOST,
    credentials: 'include',
    headers: {
      accept: 'application/json',
    },
  }),
);
