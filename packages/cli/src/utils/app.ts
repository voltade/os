import { api } from '#src/utils/api.ts';

export const app = {
  list: listApps,
};

async function listApps(orgId?: string) {
  const res = await api.app.$get({ query: { org_id: orgId } });
  const data = await res.json();
  return data;
}
