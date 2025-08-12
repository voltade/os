export function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-3xl font-bold">Oops! Something went wrong</h1>
      <p className="mb-8 text-gray-600">
        We're sorry, but something unexpected happened. Please try again later.
      </p>
      {import.meta.env.DEV && (
        <pre className="mb-4 max-w-full overflow-auto rounded bg-gray-100 p-4 text-sm">
          {error.message}
        </pre>
      )}
      <div className="flex items-center gap-3">
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
      </div>
    </div>
  );
}
