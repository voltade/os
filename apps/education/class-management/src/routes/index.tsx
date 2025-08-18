import { createFileRoute } from '@tanstack/react-router';

import ClassesTable from '#src/components/ClassesTable.tsx';
import CreateClassForm from '#src/components/CreateClassForm.tsx';

export const Route = createFileRoute('/')({
  component: Component,
});

function Component() {
  return (
    <div>
      <CreateClassForm />
      <ClassesTable />
    </div>
  );
}
