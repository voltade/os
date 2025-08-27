import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@voltade/ui/card.tsx';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

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
    studentOtpSent: false,
    studentOtpVerified: false,
    studentOtpRequired: false,
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
      studentOtp: '',
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

  // Watch student email to determine if OTP is required
  const studentEmail = watch('studentEmail');

  // Update student OTP requirement when email changes
  const handleStudentEmailChange = (email: string) => {
    const needsOtp = email && email.trim().length > 0;
    if (needsOtp !== otpStates.studentOtpRequired) {
      updateOtpStates({
        studentOtpRequired: !!needsOtp,
        ...(needsOtp
          ? {}
          : {
              studentOtpSent: false,
              studentOtpVerified: false,
            }),
      });
      if (!needsOtp) {
        methods.setValue('studentOtp', '');
      }
    }
  };

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

  const handleSendStudentOtp = async (email: string) => {
    // Validate email before sending OTP
    const isEmailValid = await trigger('studentEmail');
    if (!isEmailValid) return;

    await otpUtils.sendOtp(email);
    updateOtpStates({ studentOtpSent: true, studentOtpRequired: true });
  };

  const handleVerifyStudentOtp = async (email: string, otp: string) => {
    const isValid = await otpUtils.verifyOtp(email, otp);
    if (isValid) {
      updateOtpStates({ studentOtpVerified: true });
    }
  };

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
        if (otpStates.studentOtpSent) {
          fieldsToValidate.push('studentOtp');
        }
      }
    }

    const isStepValid = await trigger(fieldsToValidate);

    // Additional validation for OTP states
    if (step === 1) {
      const hasRequiredOtpVerification =
        !otpStates.parentOtpSent || otpStates.parentOtpVerified;
      return isStepValid && hasRequiredOtpVerification;
    } else if (step === 2) {
      if (otpStates.studentOtpRequired) {
        const hasRequiredStudentOtpVerification = otpStates.studentOtpVerified;
        return isStepValid && hasRequiredStudentOtpVerification;
      }
      return isStepValid;
    }

    return isStepValid;
  };

  const nextStep = async () => {
    if (currentStep < 3) {
      // On step 2, if a student email is present and OTP hasn't been sent yet,
      // send the OTP and stay on the same step to allow entering the OTP.
      if (
        currentStep === 2 &&
        studentEmail &&
        studentEmail.trim() &&
        !otpStates.studentOtpSent
      ) {
        const isEmailValid = await trigger('studentEmail');
        if (isEmailValid) {
          await handleSendStudentOtp(studentEmail);
        }
        return;
      }

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

  const onSubmit = (data: RegistrationFormData) => {
    console.log('Submitting form data:', data);

    // Reset form
    reset();
    setCurrentStep(1);
    setOtpStates({
      parentOtpSent: false,
      parentOtpVerified: false,
      studentOtpSent: false,
      studentOtpVerified: false,
      studentOtpRequired: false,
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
        return (
          <StudentStep
            otpStates={otpStates}
            handleStudentEmailChange={handleStudentEmailChange}
            verifyStudentOtp={handleVerifyStudentOtp}
          />
        );
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
