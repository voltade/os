/**
 * Generate shell script for uploading artifacts from within the build container
 * S3 configuration is read from environment variables
 */
export function generateS3UploadScript(
  buildId: string,
  outputPath: string,
  appId: string,
  orgId: string,
): string {
  const s3Key = `builds/${orgId}/${appId}/${buildId}/artifact.tar.gz`;

  return `
# Install AWS CLI
echo "=== Installing AWS CLI ==="
apk add --no-cache aws-cli

# Verify S3 environment variables are set
if [ -z "\$AWS_ACCESS_KEY_ID" ] || [ -z "\$AWS_SECRET_ACCESS_KEY" ] || [ -z "\$AWS_DEFAULT_REGION" ] || [ -z "\$S3_BUCKET" ]; then
  echo "Error: Missing required S3 environment variables"
  echo "Required: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, S3_BUCKET"
  exit 1
fi

echo "S3 Bucket: \$S3_BUCKET"
echo "S3 Region: \$AWS_DEFAULT_REGION"
if [ -n "\$AWS_ENDPOINT_URL" ]; then
  echo "S3 Endpoint: \$AWS_ENDPOINT_URL"
fi

# Create artifact tar.gz
echo "=== Creating artifact tar.gz from ${outputPath} ==="
ARTIFACT_FILE="/tmp/build-${buildId}.tar.gz"

if [ -d "${outputPath}" ]; then
  echo "Compressing ${outputPath}/ directory"
  cd "${outputPath}"
  tar -czf "\$ARTIFACT_FILE" .
  cd -
else
  echo "Error: Output path ${outputPath} not found"
  exit 1
fi

# Upload to S3
echo "=== Uploading to S3 ==="
echo "Uploading \$ARTIFACT_FILE to s3://\$S3_BUCKET/${s3Key}"

aws s3 cp "\$ARTIFACT_FILE" "s3://\$S3_BUCKET/${s3Key}"

if [ \$? -eq 0 ]; then
  echo "Artifact upload completed successfully"
  echo "Artifact URL: s3://\$S3_BUCKET/${s3Key}"
else
  echo "Artifact upload failed"
  exit 1
fi

# Cleanup
rm -f "\$ARTIFACT_FILE"
`;
}
