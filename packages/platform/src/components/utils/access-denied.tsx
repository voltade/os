export function AccessDenied() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
      <h2 className="text-2xl font-semibold tracking-tight">Access Denied</h2>
      <p className="text-sm text-muted-foreground">
        You do not have permission to access this page.
      </p>
    </div>
  );
}
