import { useQuery } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export const useEnvironments = () => {
  return useQuery({
    queryKey: ['environments'],
    queryFn: async () => {
      const res = await api.environment.$get({});
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data;
    },
  });
};

export const useEnvironment = (environmentSlug: string) => {
  return useQuery({
    queryKey: ['environment', environmentSlug],
    queryFn: async () => {
      const res = await api.environment[`:environmentSlug`].$get({
        param: { environmentSlug },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data;
    },
  });
};
