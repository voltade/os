import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { EmailForm } from '#src/components/auth/email-form.tsx';
import { EmailOtp } from '#src/components/auth/email-otp.tsx';

export const Route = createFileRoute('/_auth/signin')({
  component: RouteComponent,
});

export default function RouteComponent() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left: branding */}
      <div className="flex flex-1 flex-col justify-between px-8 lg:px-16">
        <div className="pt-8">
          <img
            src="https://voltade.com/images/Logo+typo.svg"
            alt="Voltade Logo"
            className="h-8 w-auto"
          />
        </div>
        <div className="flex flex-1 items-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-tight text-gray-900">
              Voltade OS
            </h1>
            <p className="mt-4 text-3xl leading-tight text-gray-900">
              Next gen business software and developer platform
            </p>
          </div>
        </div>
        <div />
      </div>

      {/* Right: sign-in form */}
      <div className="flex flex-1 items-center justify-center border-l bg-white">
        <div className="w-full max-w-sm p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-600">
              Use your email to receive a verification code.
            </p>
          </div>
          {!email ? (
            <EmailForm onEmailSent={setEmail} />
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Enter verification code
                </h3>
                <p className="text-sm text-gray-600">
                  We sent a code to {email}
                </p>
              </div>
              <EmailOtp email={email} setEmail={setEmail} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
