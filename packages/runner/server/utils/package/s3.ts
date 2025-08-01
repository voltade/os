import { S3Client } from '@aws-sdk/client-s3';

import { appEnvVariables } from '#server/env.ts';

export const s3Client = new S3Client({
  region: appEnvVariables.AWS_REGION,
  credentials: {
    accessKeyId: appEnvVariables.AWS_ACCESS_KEY_ID,
    secretAccessKey: appEnvVariables.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: appEnvVariables.AWS_S3_ENDPOINT,
  forcePathStyle: true,
});
