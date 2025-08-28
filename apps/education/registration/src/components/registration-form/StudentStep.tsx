import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@voltade/ui/form.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { useFormContext } from 'react-hook-form';

import type { RegistrationFormData } from './schema.ts';

export function StudentStep() {
  const { control } = useFormContext<RegistrationFormData>();

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
                <Input type="email" placeholder="name@example.com" {...field} />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
