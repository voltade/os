import { S3Client } from 'bun';

import { platformEnvVariables } from '#server/env.ts';

export const s3Client = new S3Client({
  region: platformEnvVariables.AWS_REGION,
  endpoint: platformEnvVariables.AWS_S3_ENDPOINT,
  bucket: platformEnvVariables.AWS_S3_BUCKET,
  accessKeyId: platformEnvVariables.AWS_ACCESS_KEY_ID,
  secretAccessKey: platformEnvVariables.AWS_SECRET_ACCESS_KEY,
  virtualHostedStyle: !platformEnvVariables.FORCE_PATH_STYLE,
});
