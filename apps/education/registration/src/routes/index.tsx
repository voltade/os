import { createFileRoute } from '@tanstack/react-router';

import RegistrationForm from '#src/components/RegistrationForm.tsx';

export const Route = createFileRoute('/')({
  component: RegistrationForm,
});
