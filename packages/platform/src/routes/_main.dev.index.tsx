import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/dev/')({
  beforeLoad: () => redirect({ to: '/dev/environments' }),
});
