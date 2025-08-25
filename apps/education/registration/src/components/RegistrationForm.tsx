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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@voltade/ui/input-otp.tsx';
import { MultiSelect } from '@voltade/ui/multiselect.tsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { api } from '#src/lib/api.ts';
import { authClient } from '#src/lib/auth.ts';
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
  studentName: string;
  school: string;
  parentPhone: string;
  parentEmail: string;
  classIds: string[];
  parentName: string;
  parentOtp: string;
  studentEmail?: string;
  studentOtp?: string;
}

export default function RegistrationForm() {
  const sendOTP = async (email: string) => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    });
  };

  const handleParentVerification = async (email: string, otp: string) => {
    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      otp,
      type: 'email-verification',
    });
    if (error) {
      toast.error(
        'Parent verification failed. Please check the OTP and try again.',
      );
      return false; // ?
    }
    //TODO: assign user to parent role (environment) & customer role (platform)
  };

  const form = useForm<RegistrationFormValues>({
    defaultValues: {
      parentEmail: '',
      parentOtp: '',
      parentName: '',
      parentPhone: '',
      studentName: '',
      studentEmail: '',
      studentOtp: '',
      school: '',
      classIds: [],
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
    mutationFn: async (payload: {
      studentName: string;
      school: string;
      studentPhone: string;
      studentEmail: string;
      selected_class_ids: number[];
    }) => {
      const res = await api['register-student'].$post({ json: payload });

      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      toast.success('Registration successful!');
    },
    onError: (_: Error) => {
      toast.error('Registration failed');
    },
  });

  const handleSubmit = (values: RegistrationFormValues) => {
    mutate({
      name: values.name,
      school: values.school,
      phone: values.phone,
      email: values.email,
      selected_class_ids: values.classIds.map((id) => Number(id)),
    });
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
            {/* Parent's Email */}
            <FormField
              control={form.control}
              name="parentEmail"
              rules={{ required: "Parent's email is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent's Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter parent's email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent's Email OTP */}
            <FormField
              control={form.control}
              name="parentOtp"
              rules={{ required: 'OTP is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      aria-label="Parent OTP"
                    >
                      <InputOTPGroup>
                        {['d1', 'd2', 'd3', 'd4', 'd5', 'd6'].map((k, i) => (
                          <InputOTPSlot key={k} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent's Name */}
            <FormField
              control={form.control}
              name="parentName"
              rules={{ required: "Parent's name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter parent's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent's Phone */}
            <FormField
              control={form.control}
              name="parentPhone"
              rules={{ required: "Parent's phone is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent's Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter parent's phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student's Name */}
            <FormField
              control={form.control}
              name="studentName"
              rules={{ required: "Student's name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student's Email (optional) */}
            <FormField
              control={form.control}
              name="studentEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student's Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter student's email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student's Email OTP (optional) */}
            <FormField
              control={form.control}
              name="studentOtp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP (Optional)</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      aria-label="Student OTP"
                    >
                      <InputOTPGroup>
                        {['sd1', 'sd2', 'sd3', 'sd4', 'sd5', 'sd6'].map(
                          (k, i) => (
                            <InputOTPSlot key={k} index={i} />
                          ),
                        )}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student's School */}
            <FormField
              control={form.control}
              name="school"
              rules={{ required: "Student's school is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student's School</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student's school" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Classes */}
            <FormField
              control={form.control}
              name="classIds"
              rules={{ required: 'At least one class is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Class(es)</FormLabel>
                  <FormControl>
                    <MultiSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={classesLoading || !!classesError}
                      options={(classesData || []).map((cls) => ({
                        value: String(cls.id),
                        label: formatClassLabel(cls),
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={
                  !form.watch('studentName') ||
                  !(form.watch('classIds')?.length > 0) ||
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
