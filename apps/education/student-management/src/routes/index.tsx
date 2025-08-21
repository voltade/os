import { createFileRoute } from '@tanstack/react-router';

import StudentsTable from '#src/components/StudentsTable.tsx';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <StudentsTable />;
}
