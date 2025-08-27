import { S3Client } from 'bun';

import { appEnvVariables } from '#server/zod/env.ts';

console.log('S3 Configuration:', {
  region: appEnvVariables.AWS_REGION,
  endpoint: appEnvVariables.AWS_S3_ENDPOINT,
  bucket: appEnvVariables.AWS_S3_BUCKET,
  virtualHostedStyle: !appEnvVariables.FORCE_PATH_STYLE,
  forcePathStyle: appEnvVariables.FORCE_PATH_STYLE,
});

export const s3Client = new S3Client({
  region: appEnvVariables.AWS_REGION,
  endpoint: appEnvVariables.AWS_S3_ENDPOINT,
  bucket: appEnvVariables.AWS_S3_BUCKET,
  accessKeyId: appEnvVariables.AWS_ACCESS_KEY_ID,
  secretAccessKey: appEnvVariables.AWS_SECRET_ACCESS_KEY,
  virtualHostedStyle: !appEnvVariables.FORCE_PATH_STYLE,
});
