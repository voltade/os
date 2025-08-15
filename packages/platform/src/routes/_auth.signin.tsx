import { createFileRoute } from '@tanstack/react-router';
import { AnimatedThemeToggler } from '@voltade/ui/magicui/animated-theme-toggler.tsx';
import { useState } from 'react';

import { AuthBranding } from '#src/components/auth/branding.tsx';
import { EmailForm } from '#src/components/auth/email-form.tsx';
import { EmailOtp } from '#src/components/auth/email-otp.tsx';
import { Logo } from '#src/components/ui/logo.tsx';

export const Route = createFileRoute('/_auth/signin')({
  component: RouteComponent,
});

export default function RouteComponent() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: branding */}
      <div className="flex flex-1 flex-col justify-between px-6 lg:px-8">
        <div className="pt-8">
          <Logo />
        </div>
        <div className="flex flex-1 items-center">
          <div className="max-w-md">
            <AuthBranding />
          </div>
        </div>
        <div />
      </div>

      {/* Right: sign-in form */}
      <div className="flex flex-1 items-center justify-center border-l border-border bg-background relative">
        <AnimatedThemeToggler className="absolute top-8 right-8 p-2 rounded-md hover:bg-accent transition-colors" />
        <div className="w-full max-w-sm p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Use your email to receive a verification code.
            </p>
          </div>
          {!email ? (
            <EmailForm onEmailSent={setEmail} />
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Enter verification code
                </h3>
                <p className="text-sm text-muted-foreground">
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
