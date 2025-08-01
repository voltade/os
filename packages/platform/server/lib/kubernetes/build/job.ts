import type { KubernetesObjectApi, V1Job } from '@kubernetes/client-node';

import type { appTable } from '#drizzle/app.ts';
import { generateS3UploadScript } from './artifacts.ts';

export interface BuildJobOptions {
  /** Resource limits for the build container */
  resources?: {
    cpu?: string;
    memory?: string;
  };
  /** Whether to enable S3 artifact upload */
  enableS3Upload?: boolean;
  /** Callback URL to notify when build completes */
  statusCallbackUrl?: string;
}

export function createBuildJob(
  k8sClient: KubernetesObjectApi,
  app: typeof appTable.$inferSelect,
  buildId: string,
  options: BuildJobOptions = {},
) {
  const { resources = {}, enableS3Upload = false, statusCallbackUrl } = options;

  // Build script that handles git clone, branch switch, path navigation, and build
  const buildScript = `
#!/bin/sh

# Function to report status to callback URL
report_status() {
  local status="\$1"
  local message="\$2"
  
  ${
    statusCallbackUrl
      ? `
  echo "Reporting status: \$status - \$message"
  curl -X PATCH "${statusCallbackUrl}" \\
    -H "Content-Type: application/json" \\
    -d "{
      \"appId\": \"${app.id}\",
      \"orgId\": \"${app.organization_id}\",
      \"status\": \"\$status\",
      \"logs\": \"\$message\"
    }" || echo "Failed to report status"
  `
      : 'echo "Status: $status - $message"'
  }
}

# Function to handle errors
handle_error() {
  local error_message="\$1"
  echo "ERROR: \$error_message"
  report_status "error" "\$error_message"
  exit 1
}

# Set error handling
trap 'handle_error "Build script failed unexpectedly"' ERR

echo "=== Starting build process ==="
echo "App ID: ${app.id}"
echo "Build ID: ${buildId}"
echo "Repository: ${app.git_repo_url}"
echo "Branch: ${app.git_repo_branch}"
echo "Path: ${app.git_repo_path}"
echo "Build Command: ${app.build_command}"

report_status "building" "Starting build process"

# Install git and other necessary tools
echo "=== Installing dependencies ==="
apk add --no-cache git openssh-client curl zip || handle_error "Failed to install system dependencies"

# Create workspace
mkdir -p /workspace
cd /workspace

echo "=== Cloning repository ==="
git clone "${app.git_repo_url}" repo || handle_error "Failed to clone repository"
cd repo

echo "=== Switching to branch: ${app.git_repo_branch} ==="
git checkout "${app.git_repo_branch}" || handle_error "Failed to checkout branch ${app.git_repo_branch}"

# Navigate to specified path if provided
if [ -n "${app.git_repo_path}" ] && [ "${app.git_repo_path}" != "" ]; then
  echo "=== Navigating to path: ${app.git_repo_path} ==="
  cd "${app.git_repo_path}" || handle_error "Failed to navigate to path ${app.git_repo_path}"
fi

echo "=== Current directory contents ==="
ls -la

report_status "building" "Installing project dependencies"

echo "=== Installing project dependencies ==="
if [ -f "package.json" ]; then
  bun install || handle_error "Failed to install dependencies"
else
  echo "No package.json found, skipping dependency installation"
fi

report_status "building" "Running build command"

echo "=== Running build command: ${app.build_command} ==="
eval "${app.build_command}" || handle_error "Build command failed"

echo "=== Build completed successfully ==="

# List build artifacts for debugging
echo "=== Build artifacts ==="
if [ -d "${app.output_path}" ]; then
  echo "Contents of ${app.output_path}:"
  ls -la "${app.output_path}" || echo "Directory not accessible"
else
  echo "Output path ${app.output_path} not found"
fi

${
  enableS3Upload
    ? `
report_status "building" "Uploading build artifacts to S3"

${generateS3UploadScript(buildId, app.output_path, app.id, app.organization_id)}

report_status "ready" "Build completed successfully with artifacts uploaded to S3"
`
    : `
report_status "ready" "Build completed successfully"
`
}

echo "=== Build process completed ==="
`;

  const job: V1Job = {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: `${app.id}-build-${buildId}`,
      namespace: 'platform',
      labels: {
        'app.voltade.dev/app-id': app.id,
        'app.voltade.dev/build-id': buildId,
        'app.voltade.dev/component': 'build-job',
      },
    },
    spec: {
      ttlSecondsAfterFinished: 86400, // Clean up after 24 hours
      backoffLimit: 0,
      template: {
        metadata: {
          labels: {
            'app.voltade.dev/app-id': app.id,
            'app.voltade.dev/build-id': buildId,
            'app.voltade.dev/component': 'build-job',
          },
        },
        spec: {
          restartPolicy: 'Never',
          containers: [
            {
              name: 'build',
              image: 'oven/bun:1.2.9-alpine',
              workingDir: '/workspace',
              command: ['/bin/sh'],
              args: ['-c', buildScript],
              env: [
                {
                  name: 'APP_ID',
                  value: app.id,
                },
                {
                  name: 'BUILD_ID',
                  value: buildId,
                },
                {
                  name: 'NODE_ENV',
                  value: 'production',
                },
                ...(enableS3Upload
                  ? [
                      {
                        name: 'AWS_ACCESS_KEY_ID',
                        valueFrom: {
                          secretKeyRef: {
                            name: 'minio-secrets',
                            key: 'root-user',
                          },
                        },
                      },
                      {
                        name: 'AWS_SECRET_ACCESS_KEY',
                        valueFrom: {
                          secretKeyRef: {
                            name: 'minio-secrets',
                            key: 'root-password',
                          },
                        },
                      },
                      {
                        name: 'AWS_DEFAULT_REGION',
                        value: 'ap-southeast-1',
                      },
                      {
                        name: 'S3_BUCKET',
                        value: 'builds',
                      },
                      {
                        name: 'AWS_ENDPOINT_URL',
                        value: 'http://minio.minio:9000',
                      },
                    ]
                  : []),
              ],
              volumeMounts: [
                {
                  name: 'voltade-os',
                  readOnly: true,
                  mountPath: '/mnt/voltade-os.git',
                },
              ],
              resources: {
                limits: {
                  cpu: resources.cpu || '2',
                  memory: resources.memory || '4Gi',
                },
                requests: {
                  cpu: '500m',
                  memory: '1Gi',
                },
              },
            },
          ],
          volumes: [
            {
              name: 'voltade-os',
              hostPath: {
                path: '/mnt/voltade-os.git',
                type: 'Directory',
              },
            },
          ],
        },
      },
    },
  };

  return k8sClient.create(job);
}
