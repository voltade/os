import { LoaderIcon } from 'lucide-react';

export function LoaderComponent({ loading }: { loading?: boolean }) {
  if (!loading) {
    return null;
  }
  return (
    <div className="flex min-w-screen min-h-screen flex-col items-center justify-center p-4 gap-3 text-muted-foreground fixed top-0 left-0 pointer-events-none">
      <LoaderIcon className="animate-spin" />
      <p className="text-sm">Loading...</p>
    </div>
  );
}
