import { Button } from '@voltade/ui/button.tsx';
import {
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
import { useFormContext } from 'react-hook-form';

import type { RegistrationFormData } from './schema.ts';
import type { OtpStates } from './types.ts';

interface StudentStepProps {
  otpStates: OtpStates;
  handleStudentEmailChange: (email: string) => void;
  sendStudentOtp: (email: string) => Promise<void>;
  verifyStudentOtp: (email: string, otp: string) => Promise<void>;
}

export function StudentStep({
  otpStates,
  handleStudentEmailChange,
  sendStudentOtp,
  verifyStudentOtp,
}: StudentStepProps) {
  const { control, getValues } = useFormContext<RegistrationFormData>();
  const { studentOtpRequired, studentOtpSent, studentOtpVerified } = otpStates;

  return (
    <div className="grid gap-4">
      <FormField
        control={control}
        name="studentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Student's Name</FormLabel>
            <FormControl>
              <Input placeholder="Full name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="studentEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Student's Email (Optional)</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleStudentEmailChange(e.target.value);
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={() => field.value && sendStudentOtp(field.value)}
                disabled={!field.value}
              >
                Send OTP
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {studentOtpRequired && studentOtpSent && (
        <FormField
          control={control}
          name="studentOtp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student OTP</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value || ''}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const email = getValues('studentEmail');
                    if (email && field.value && field.value.length === 6) {
                      verifyStudentOtp(email, field.value);
                    }
                  }}
                  disabled={
                    !getValues('studentEmail') ||
                    !field.value ||
                    field.value.length !== 6 ||
                    studentOtpVerified
                  }
                >
                  {studentOtpVerified ? 'Verified' : 'Verify'}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
