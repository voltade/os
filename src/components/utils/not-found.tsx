import { Group } from '@mantine/core';

export function NotFoundComponent({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-3xl font-bold">Not Found</h1>
      {message && (
        <pre className="mb-4 max-w-full overflow-auto rounded bg-gray-100 p-4 text-sm">
          {message}
        </pre>
      )}
      <Group>
        <button
          type="button"
          onClick={() => {
            window.history.back();
          }}
          className="rounded bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"
        >
          Go back
        </button>
        <a
          href="/"
          className="rounded bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"
        >
          Back to Home
        </a>
      </Group>
    </div>
  );
}
