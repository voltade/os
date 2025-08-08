import { api } from './api.ts';

export const org = {
  list: listOrgs,
};

async function listOrgs() {
  const res = await api.organization.$get();
  const orgs = await res.json();
  return orgs;
}
