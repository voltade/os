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

interface ParentStepProps {
  otpStates: OtpStates;
  sendParentOtp: (email: string) => Promise<void>;
  verifyParentOtp: (email: string, otp: string) => Promise<void>;
}

export function ParentStep({
  otpStates,
  sendParentOtp,
  verifyParentOtp,
}: ParentStepProps) {
  const { control, getValues } = useFormContext<RegistrationFormData>();
  const { parentOtpSent, parentOtpVerified } = otpStates;

  return (
    <div className="grid gap-4">
      <FormField
        control={control}
        name="parentEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent's Email</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input type="email" placeholder="name@example.com" {...field} />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={() => field.value && sendParentOtp(field.value)}
                disabled={!field.value}
              >
                Send OTP
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {parentOtpSent && (
        <FormField
          control={control}
          name="parentOtp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent OTP</FormLabel>
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
                    const email = getValues('parentEmail');
                    if (email && field.value && field.value.length === 6) {
                      verifyParentOtp(email, field.value);
                    }
                  }}
                  disabled={
                    !getValues('parentEmail') ||
                    !field.value ||
                    field.value.length !== 6 ||
                    parentOtpVerified
                  }
                >
                  {parentOtpVerified ? 'Verified' : 'Verify'}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="parentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent's Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Full name"
                {...field}
                disabled={!parentOtpVerified}
                className={!parentOtpVerified ? 'opacity-50' : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="parentPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent's Phone</FormLabel>
            <FormControl>
              <Input
                placeholder="+65 9XXXXXXX"
                {...field}
                disabled={!parentOtpVerified}
                className={!parentOtpVerified ? 'opacity-50' : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
