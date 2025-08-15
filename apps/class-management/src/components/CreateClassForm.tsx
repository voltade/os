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

interface CreateClassFormValues {
  level_group_id: number;
  subject_id: number;
  usual_day_of_the_week:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  usual_start_time_utc: string;
  usual_end_time_utc: string;
}

export default function CreateClassForm() {
  const form = useForm<CreateClassFormValues>({
    mode: 'onChange',
  });

  const {
    data: levelGroupData,
    isLoading: levelGroupLoading,
    error: levelGroupError,
  } = useQuery({
    queryKey: ['level_groups'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('level_group_view')
        .select('id, name');
      if (error)
        throw new Error(`Failed to fetch level groups: ${error.message}`);
      // TODO: Fix typing issue.
      return data as {
        id: number;
        name: string;
      }[];
    },
  });

  const {
    data: subjectData,
    isLoading: subjectLoading,
    error: subjectError,
  } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('subject_view')
        .select('id, name');
      if (error) throw new Error(`Failed to fetch subjects: ${error.message}`);
      return data as { id: number; name: string }[];
    },
  });

  const { mutate, status: mutationStatus } = useMutation({
    mutationFn: async (payload: CreateClassFormValues) => {
      const res = await api['create-class'].$post({
        json: payload,
      });

      if (!res.ok) throw new Error('Class creation failed');
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      toast.success('Class created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Class creation failed: ${error.message}`);
    },
  });

  const handleSubmit = (values: CreateClassFormValues) => {
    // Convert SGT to UTC HH:mm:ss
    const startUtc = dayjs
      .tz(values.usual_start_time_utc, 'HH:mm', 'Asia/Singapore')
      .utc()
      .format('HH:mm:ss');
    const endUtc = dayjs
      .tz(values.usual_end_time_utc, 'HH:mm', 'Asia/Singapore')
      .utc()
      .format('HH:mm:ss');
    mutate({
      level_group_id: Number(values.level_group_id),
      subject_id: Number(values.subject_id),
      usual_day_of_the_week: values.usual_day_of_the_week,
      usual_start_time_utc: startUtc,
      usual_end_time_utc: endUtc,
    });
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Class Creation Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="level_group_id"
              rules={{ required: 'Level group is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level Group</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger
                        disabled={levelGroupLoading || !!levelGroupError}
                      >
                        <SelectValue
                          placeholder={
                            levelGroupLoading
                              ? 'Loading...'
                              : 'Choose a level group'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {levelGroupData?.map((lg) => (
                        <SelectItem
                          key={lg.id}
                          value={String(lg.id)}
                          className="rounded-lg"
                        >
                          {lg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject_id"
              rules={{ required: 'Subject is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger
                        disabled={subjectLoading || !!subjectError}
                      >
                        <SelectValue
                          placeholder={
                            subjectLoading ? 'Loading...' : 'Choose a subject'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {subjectData?.map((subj) => (
                        <SelectItem
                          key={subj.id}
                          value={String(subj.id)}
                          className="rounded-lg"
                        >
                          {subj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usual_day_of_the_week"
              rules={{ required: 'Day of week is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of the Week</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {[
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday',
                      ].map((day) => (
                        <SelectItem
                          key={day}
                          value={day}
                          className="rounded-lg"
                        >
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usual_start_time_utc"
              rules={{ required: 'Start time is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time (SGT)</FormLabel>
                  <FormControl>
                    <Input type="time" step="60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usual_end_time_utc"
              rules={{ required: 'End time is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time (SGT)</FormLabel>
                  <FormControl>
                    <Input type="time" step="60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={
                  !form.watch('level_group_id') ||
                  !form.watch('subject_id') ||
                  !form.watch('usual_day_of_the_week') ||
                  !form.watch('usual_start_time_utc') ||
                  !form.watch('usual_end_time_utc') ||
                  mutationStatus === 'pending' ||
                  levelGroupLoading ||
                  subjectLoading
                }
              >
                {mutationStatus === 'pending' ? 'Creating…' : 'Create Class'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
