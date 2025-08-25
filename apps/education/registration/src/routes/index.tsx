import { createFileRoute } from '@tanstack/react-router';

import RegistrationForm from '#src/components/registration-form/Form.tsx';

export const Route = createFileRoute('/')({
  component: RegistrationForm,
});
