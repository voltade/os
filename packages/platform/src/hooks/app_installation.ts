import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export type AppInstallation = NonNullable<
  Awaited<ReturnType<typeof useAppInstallations>>['data']
>[number];

export const useAppInstallations = (environmentId: string) => {
  return useQuery({
    queryKey: ['appInstallations', environmentId],
    queryFn: async () => {
      const res = await api.app_installation.$get({
        query: {
          environment_id: environmentId,
        },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data ?? [];
    },
  });
};

export const useInstallApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      app_id: string;
      environment_id: string;
      organization_id: string;
      app_build_id: string;
    }) => {
      const res = await api.app_installation.$post({ json: data });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appInstallations', variables.environment_id],
      });
    },
  });
};

export const useUninstallApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      app_id: string;
      environment_id: string;
      org_id: string;
    }) => {
      const res = await api.app_installation.$delete({
        query: data,
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appInstallations', variables.environment_id],
      });
    },
  });
};

export const useUpdateInstallationBuild = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      app_id: string;
      environment_id: string;
      organization_id: string;
      app_build_id: string;
    }) => {
      const res = await api.app_installation.$put({ json: data });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appInstallations', variables.environment_id],
      });
    },
  });
};
