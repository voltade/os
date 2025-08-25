import type { Step } from './types.ts';

interface StepIndicatorProps {
  currentStep: Step;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { n: 1, label: 'Parent' },
    { n: 2, label: 'Student' },
    { n: 3, label: 'Classes' },
  ];

  return (
    <div className="mb-6 flex items-center gap-4">
      {steps.map(({ n, label }, i) => {
        const active = currentStep === (n as Step);
        const completed = currentStep > (n as Step);
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium',
                active
                  ? 'border-primary text-primary'
                  : completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground',
              ].join(' ')}
            >
              {n}
            </div>
            <span
              className={[
                'text-sm',
                active
                  ? 'text-primary'
                  : completed
                    ? 'text-foreground'
                    : 'text-muted-foreground',
              ].join(' ')}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px w-10 shrink-0 bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}
