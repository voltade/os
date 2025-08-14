import { api } from '#src/utils/api.ts';

export const appBuild = {
  git: buildFromGit,
  list: listBuilds,
  get: getBuild,
  triggerS3Build: triggerS3Build,
};

async function buildFromGit(appId: string, orgId: string) {
  const res = await api.app_build.git.$post({
    json: { appId, orgId },
  });
  const data = await res.json();
  return data;
}

async function listBuilds(appId: string, orgId: string) {
  const res = await api.app_build.$get({
    query: { appId, orgId },
  });
  const data = await res.json();
  return data;
}

async function getBuild(buildId: string, appId: string, orgId: string) {
  const res = await api.app_build[':buildId'].$get({
    param: { buildId },
    query: { appId, orgId },
  });
  const data = await res.json();
  return data;
}

async function triggerS3Build(appId: string, orgId: string, buildId: string) {
  const res = await api.app_build.s3.$post({
    json: { appId, orgId, buildId },
  });
  const data = await res.json();
  return data;
}
