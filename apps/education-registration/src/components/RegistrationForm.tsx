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
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { api } from '#src/lib/api.ts';
import { pgRest } from '#src/lib/pg-rest.ts';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const formatClassLabel = (c: {
  level_group_name?: string;
  subject_name?: string;
  usual_day_of_the_week?: string;
  usual_start_time_utc?: string;
  usual_end_time_utc?: string;
}) => {
  // Map weekday to index (Mon=0..Sun=6)
  const WEEKDAY_TO_INDEX: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };
  const normDay = (c.usual_day_of_the_week || '')
    .toLowerCase()
    .replace(/s$/, '');
  const dayIdx = WEEKDAY_TO_INDEX[normDay] ?? 0;

  // 2024-01-01 is a Monday. Build a UTC date for the class weekday to be attached to the start and end times.
  // This is because dayjs.tz needs a full datetime to perform time zone conversions.
  const baseMondayUtc = dayjs
    .utc('2024-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss', true)
    .add(dayIdx, 'day');

  const startUtc = dayjs.utc(
    `${baseMondayUtc.format('YYYY-MM-DD')} ${c.usual_start_time_utc || '00:00:00'}`,
    'YYYY-MM-DD HH:mm:ss',
    true,
  );
  const endUtc = dayjs.utc(
    `${baseMondayUtc.format('YYYY-MM-DD')} ${c.usual_end_time_utc || '00:00:00'}`,
    'YYYY-MM-DD HH:mm:ss',
    true,
  );

  const startSgt = startUtc.tz('Asia/Singapore');
  const endSgt = endUtc.tz('Asia/Singapore');

  const localDay = `${startSgt.format('dddd')}s`;
  const startLabel = startSgt.format('h A');
  const endLabel = endSgt.format('h A');

  return `${c.level_group_name} ${c.subject_name} (${localDay}, ${startLabel}–${endLabel})`;
};

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
        .select(
          'id, level_group_name, subject_name, usual_day_of_the_week, usual_start_time_utc, usual_end_time_utc',
        );
      if (error) throw new Error(`Failed to fetch classes: ${error.message}`);
      // TODO: Fix typing issue.
      return data as {
        id: number;
        level_group_name: string;
        subject_name: string;
        usual_day_of_the_week: string;
        usual_start_time_utc: string;
        usual_end_time_utc: string;
      }[];
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
                      {classesData?.map((cls) => (
                        <SelectItem
                          key={cls.id}
                          value={String(cls.id)}
                          className="rounded-lg"
                        >
                          {formatClassLabel(cls)}
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
