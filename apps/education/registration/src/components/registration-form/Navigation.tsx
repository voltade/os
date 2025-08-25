import { Button } from '@voltade/ui/button.tsx';

import type { Step } from './types.ts';

interface NavigationProps {
  currentStep: Step;
  onNext: () => void;
  onBack: () => void;
}

export function Navigation({ currentStep, onNext, onBack }: NavigationProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1}
      >
        Back
      </Button>

      {currentStep < 3 && (
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      )}
    </div>
  );
}
