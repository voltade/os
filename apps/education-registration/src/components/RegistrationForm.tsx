import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@voltade/ui/card.tsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@voltade/ui/form.tsx';
import { Input } from '@voltade/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { api } from '#src/lib/api.ts';
import { pgRest } from '#src/lib/pg-rest.ts';

interface RegistrationFormValues {
  name: string;
  classId: string;
}

export default function RegistrationForm() {
  const form = useForm<RegistrationFormValues>({
    defaultValues: {
      name: '',
      classId: '',
    },
    mode: 'onChange',
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
      const res = await api['register-student'].$post({
        json: payload,
      });

      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
    onSuccess: () => {
      // NOTE: There is no need to invalidate the 'students' query key used by
      // the students route because the QueryClient's stale time is the default 0.
      form.reset();
      toast.success('Registration successful!');
    },
    onError: (error: Error) => {
      toast.error('Registration failed');
    },
  });

  const handleSubmit = (values: RegistrationFormValues) => {
    mutate({ name: values.name, selected_class: Number(values.classId) });
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Registration Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              rules={{ required: 'Class is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        disabled={classesLoading || !!classesError}
                      >
                        <SelectValue
                          placeholder={
                            classesLoading ? 'Loading...' : 'Choose a class'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {(
                        classesData as
                          | Array<{ id: number; temporary_name: string | null }>
                          | undefined
                      )?.map((cls) => (
                        <SelectItem
                          key={cls.id}
                          value={String(cls.id)}
                          className="rounded-lg"
                        >
                          Class #{cls.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={
                  !form.watch('name') ||
                  !form.watch('classId') ||
                  mutationStatus === 'pending' ||
                  classesLoading
                }
              >
                {mutationStatus === 'pending' ? 'Registering…' : 'Register'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
