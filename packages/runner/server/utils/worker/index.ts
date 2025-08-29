const workerMap = new Map<string, Worker>();

export const getWorker = (
  appId: string,
  truncatedReleaseId: string,
): Worker | undefined => {
  const worker = workerMap.get(`${appId}-${truncatedReleaseId}`);
  return worker;
};

export const createWorker = async (
  appId: string,
  truncatedReleaseId: string,
  workerPath: string,
  envs: Record<string, string>,
) => {
  const worker = new Worker(`${workerPath}/index.js`, {
    env: {
      NODE_ENV: 'production',
      ...envs,
    },
  });

  // Set up worker event listeners for logging
  worker.addEventListener('message', (event) => {
    console.info(
      appId,
      'info',
      `Worker message: ${JSON.stringify(event.data)}`,
    );
  });

  worker.addEventListener('error', (error) => {
    console.info(appId, 'error', `Worker error: ${error.message}`);
  });

  worker.addEventListener('messageerror', (error) => {
    console.info(appId, 'error', `Worker message error: ${error}`);
  });

  worker.addEventListener('exit', (code) => {
    console.info(appId, 'warn', `Worker exited with code: ${code}`);
    workerMap.delete(appId);
  });

  // Wait for worker to be ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.info(appId, 'error', 'Worker startup timeout');
      reject(new Error('Worker startup timeout'));
    }, 5000);

    worker?.addEventListener('open', () => {
      clearTimeout(timeout);
      console.info(appId, 'info', 'Worker ready');
      resolve();
    });
  });
  workerMap.set(`${appId}-${truncatedReleaseId}`, worker);
  return worker;
};

export const deleteWorker = (appId: string, truncatedReleaseId: string) => {
  const worker = workerMap.get(`${appId}-${truncatedReleaseId}`);
  if (worker) {
    worker.terminate();
    workerMap.delete(`${appId}-${truncatedReleaseId}`);
  }
};
