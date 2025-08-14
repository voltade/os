import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateEnvironmentInput } from '#shared/schemas/environment.ts';
import { api } from '#src/lib/api.ts';

export const useEnvironments = (orgId: string, enabled = true) => {
  return useQuery({
    queryKey: ['environments', orgId],
    queryFn: async () => {
      const res = await api.environment.$get({
        query: {
          orgId,
        },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data;
    },
    enabled: enabled && !!orgId,
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

export const useCreateEnvironment = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEnvironmentInput) => {
      const res = await api.environment.$post({ json: data });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments', orgId] });
    },
  });
};
