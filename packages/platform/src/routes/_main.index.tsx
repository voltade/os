import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/')({
  component: () => <Navigate to="/apps" />,
});
