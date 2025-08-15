import { createFileRoute } from '@tanstack/react-router';

import CreateClassForm from '#src/components/CreateClassForm.tsx';

export const Route = createFileRoute('/')({
  component: CreateClassForm,
});
