import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export const useEnvironmentVariables = (environmentId: string) => {
  return useQuery({
    queryKey: ['environmentVariables', environmentId],
    queryFn: async () => {
      const res = await api.environment_variable.$get({
        query: {
          environment_id: environmentId,
        },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data;
    },
  });
};

export const useEnvironmentVariablesWithSecrets = (
  environmentId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['environmentVariablesWithSecrets', environmentId],
    queryFn: async () => {
      const res = await api.environment_variable.secret.$get({
        query: {
          environment_id: environmentId,
        },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useCreateEnvironmentVariable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      environment_id: string;
      name: string;
      description: string | null;
      value: string;
    }) => {
      const res = await api.environment_variable.$post({
        json: data,
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['environmentVariables', variables.environment_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['environmentVariablesWithSecrets', variables.environment_id],
      });
    },
  });
};

export const useUpdateEnvironmentVariable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      description: string | null;
      value: string;
    }) => {
      const res = await api.environment_variable.$put({
        json: data,
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      // We need to invalidate queries for the environment that this variable belongs to
      queryClient.invalidateQueries({
        queryKey: ['environmentVariables'],
      });
      queryClient.invalidateQueries({
        queryKey: ['environmentVariablesWithSecrets'],
      });
    },
  });
};

export const useDeleteEnvironmentVariable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.environment_variable.$delete({
        query: { id },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['environmentVariables'],
      });
      queryClient.invalidateQueries({
        queryKey: ['environmentVariablesWithSecrets'],
      });
    },
  });
};

export const useBulkCreateEnvironmentVariables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      variables: Array<{
        environment_id: string;
        name: string;
        description: string | null;
        value: string;
      }>,
    ) => {
      const results = [];
      for (const variable of variables) {
        const res = await api.environment_variable.$post({
          json: variable,
        });
        if (!res.ok) {
          throw new Error(
            `Failed to create ${variable.name}: ${res.statusText}`,
          );
        }
        results.push(await res.json());
      }
      return results;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        const environmentId = variables[0].environment_id;
        queryClient.invalidateQueries({
          queryKey: ['environmentVariables', environmentId],
        });
        queryClient.invalidateQueries({
          queryKey: ['environmentVariablesWithSecrets', environmentId],
        });
      }
    },
  });
};
