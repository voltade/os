import { Button, Select, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { api } from '#src/lib/api.ts';
import { pgRest } from '#src/lib/pg-rest.ts';

export const Route = createFileRoute('/registration-form')({
  component: RouteComponent,
});

interface RegistrationFormValues {
  name: string;
  classId: string;
}

function RouteComponent() {
  const form = useForm<RegistrationFormValues>({
    initialValues: {
      name: '',
      classId: '',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      classId: (value) => (value ? null : 'Class is required'),
    },
  });

  const {
    data: classesData,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('class_view')
        .select('id, temporary_name');
      if (error) throw new Error(`Failed to fetch classes: ${error.message}`);
      return data;
    },
  });

  const { mutate, status: mutationStatus } = useMutation({
    mutationFn: async (payload: { name: string; selected_class: number }) => {
      const res = await api.education['register-student'].$post({
        json: payload,
      });

      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
    onSuccess: () => {
      // NOTE: There is no need to invalidate the 'students' query key used by
      // the students route because the QueryClient's stale time is the default 0.
      form.reset();
      notifications.show({
        title: 'Success',
        message: 'Registration successful!',
        color: 'green',
        autoClose: 3000,
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Registration failed',
        message: error.message,
        color: 'red',
        autoClose: 5000,
      });
    },
  });

  const handleSubmit = (values: RegistrationFormValues) => {
    mutate({ name: values.name, selected_class: Number(values.classId) });
  };

  return (
    <Stack>
      <Title order={2}>Registration Form</Title>
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
        <Stack>
          <TextInput
            label="Student Name"
            {...form.getInputProps('name')}
            required
          />
          <Select
            label="Select Class"
            data={
              classesData?.map((cls) => ({
                value: String(cls.id),
                label: cls.temporary_name ?? 'Unnamed Class',
              })) ?? []
            }
            {...form.getInputProps('classId')}
            required
            placeholder={classesLoading ? 'Loading...' : 'Choose a class'}
            disabled={classesLoading || !!classesError}
          />
          <Button
            type="submit"
            loading={mutationStatus === 'pending'}
            disabled={
              !form.values.name ||
              !form.values.classId ||
              mutationStatus === 'pending' ||
              classesLoading
            }
          >
            Register
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
