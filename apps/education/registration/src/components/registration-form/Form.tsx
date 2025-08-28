import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@voltade/ui/card.tsx';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { api } from '#src/lib/api.ts';
import { authClient } from '#src/lib/auth.ts';
import { ClassesStep } from './ClassesStep.tsx';
import { Navigation } from './Navigation.tsx';
import * as otpUtils from './otp-utils.ts';
import { ParentStep } from './ParentStep.tsx';
import { StepIndicator } from './StepIndicator.tsx';
import { StudentStep } from './StudentStep.tsx';
import { type RegistrationFormData, registrationSchema } from './schema.ts';
import type { OtpStates, Step } from './types.ts';

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [otpStates, setOtpStates] = useState<OtpStates>({
    parentOtpSent: false,
    parentOtpVerified: false,
  });

  // Initialize react-hook-form
  const methods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: {
      parentEmail: '',
      parentOtp: '',
      parentName: '',
      parentPhone: '',
      studentName: '',
      studentEmail: '',
    },
  });

  const {
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { isValid },
  } = methods;

  const updateOtpStates = (updates: Partial<OtpStates>) => {
    setOtpStates((prev) => ({ ...prev, ...updates }));
  };

  const studentEmail = watch('studentEmail');

  // OTP handlers
  const handleSendParentOtp = async (email: string) => {
    // Validate email before sending OTP
    const isEmailValid = await trigger('parentEmail');
    if (!isEmailValid) return;

    await otpUtils.sendParentOtp(email);
    updateOtpStates({ parentOtpSent: true });
  };

  const handleVerifyParentOtp = async (email: string, otp: string) => {
    const isValid = await otpUtils.verifyParentOtp(email, otp);
    if (isValid) {
      updateOtpStates({ parentOtpVerified: true });
    }
  };

  // Student OTP removed

  // Step validation
  const validateStep = async (step: Step): Promise<boolean> => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = ['parentEmail', 'parentName', 'parentPhone'];
      if (otpStates.parentOtpSent) {
        fieldsToValidate.push('parentOtp');
      }
    } else if (step === 2) {
      fieldsToValidate = ['studentName'];
      if (studentEmail && studentEmail.trim()) {
        fieldsToValidate.push('studentEmail');
      }
    }

    const isStepValid = await trigger(fieldsToValidate);

    // Additional validation for OTP states
    if (step === 1) {
      const hasRequiredOtpVerification =
        !otpStates.parentOtpSent || otpStates.parentOtpVerified;
      return isStepValid && hasRequiredOtpVerification;
    } else if (step === 2) {
      return isStepValid;
    }

    return isStepValid;
  };

  const nextStep = async () => {
    if (currentStep < 3) {
      // Student OTP flow removed

      const isStepValid = await validateStep(currentStep);
      if (isStepValid) {
        // When Parent Step (step 1) is completed, update the user profile
        if (currentStep === 1) {
          const { parentName, parentPhone } = methods.getValues();
          const trimmedName = parentName?.trim();
          const trimmedPhone = parentPhone?.trim();
          if (trimmedName && trimmedPhone) {
            try {
              await authClient.updateUser({
                name: trimmedName,
                phoneNumber: trimmedPhone,
              });
            } catch (e) {
              // Silently continue if update fails; not blocking navigation
            }
          }
        }
        setCurrentStep((currentStep + 1) as Step);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    const selectedClassIds = [1]; // TODO: replace with real selected class IDs

    try {
      const res = await api.register.$post({
        json: {
          name: data.studentName,
          email: data.studentEmail || '',
          selected_class_ids: selectedClassIds,
        },
      });
      if (!res.ok) throw new Error('Registration failed');
      await res.json();
    } catch (err) {
      console.error(err);
    }

    // Reset fields but remain on current step (or navigate as desired)
    reset();
    setOtpStates({
      parentOtpSent: false,
      parentOtpVerified: false,
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ParentStep
            otpStates={otpStates}
            sendParentOtp={handleSendParentOtp}
            verifyParentOtp={handleVerifyParentOtp}
          />
        );
      case 2:
        return <StudentStep />;
      case 3:
        return <ClassesStep />;
      default:
        return null;
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <StepIndicator currentStep={currentStep} />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            {renderCurrentStep()}

            {/* Submit button only on step 3 */}
            {currentStep === 3 && (
              <div className="mt-2 flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            )}
          </form>
        </FormProvider>

        {/* Navigation buttons outside form */}
        <Navigation
          currentStep={currentStep}
          onNext={nextStep}
          onBack={prevStep}
        />
      </CardContent>
    </Card>
  );
}
