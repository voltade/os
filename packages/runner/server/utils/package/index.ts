import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import * as tar from 'tar';

import { appEnvVariables } from '#server/env.ts';
import { s3Client } from './s3.ts';

export const downloadPackage = async (
  packageDetails: {
    orgId: string;
    appId: string;
    releaseId: string;
  },
  outputPath: string,
) => {
  const getPackageCommand = new GetObjectCommand({
    Bucket: appEnvVariables.AWS_S3_BUCKET,
    Key: `builds/${packageDetails.orgId}/${packageDetails.appId}/${packageDetails.releaseId}/artifact.tar.gz`,
  });

  const response = await s3Client.send(getPackageCommand);
  if (!response.Body) {
    console.info(
      packageDetails.appId,
      'error',
      'Failed to download package: No response body',
    );
    throw new Error('Failed to download package: No response body');
  }

  const byteStream = await response.Body.transformToByteArray();

  await mkdir(outputPath, { recursive: true });

  // Extract tar.gz to output path
  await new Promise<void>((resolve, reject) => {
    const extractStream = tar.extract({
      cwd: outputPath,
      gzip: true,
    });

    extractStream.on('end', () => resolve());
    extractStream.on('error', reject);

    const readable = Readable.from(Buffer.from(byteStream));
    readable.pipe(extractStream);
  });

  console.info(packageDetails.appId, 'info', 'Package extracted successfully');
  return outputPath;
};
