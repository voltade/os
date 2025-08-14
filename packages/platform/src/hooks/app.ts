import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateAppInput, UpdateAppInput } from '#shared/schemas/app.ts';
import { api } from '#src/lib/api.ts';

export const useApps = (orgId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['apps', orgId],
    queryFn: async () => {
      const res = await api.app.$get({
        query: { org_id: orgId },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data;
    },
    enabled: (options?.enabled ?? true) && !!orgId,
  });
};

export const useUpdateApp = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateAppInput) => {
      const res = await api.app.$put({ json: data });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', orgId] });
    },
  });
};

export const useCreateApp = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAppInput) => {
      const res = await api.app.$post({ json: data });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', orgId] });
    },
  });
};
