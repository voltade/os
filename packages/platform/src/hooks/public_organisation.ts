import { useQuery } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export const usePublicOrganisation = (slug: string) => {
  return useQuery({
    queryKey: ['publicOrganisation', slug],
    queryFn: async () => {
      const res = await api.organization.public.$get({
        query: { organizationSlug: slug },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    enabled: Boolean(slug),
  });
};
