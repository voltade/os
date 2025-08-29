import { useQuery } from '@tanstack/react-query';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@voltade/ui/form.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';
import { useFormContext } from 'react-hook-form';

import { pgRest } from '#src/lib/pg-rest.ts';
import type { RegistrationFormData } from './schema.ts';

type ClassRow = {
  id: number;
  level_group_name: string;
  subject_name: string;
};

export function ClassesStep() {
  const { control } = useFormContext<RegistrationFormData>();

  const { data: classes } = useQuery({
    queryKey: ['classes-options'],
    queryFn: async (): Promise<ClassRow[]> => {
      const { data, error } = await pgRest
        .from('class_view')
        .select('id, level_group_name, subject_name')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as ClassRow[];
    },
  });

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Step 3: Classes</h2>

      <FormField
        control={control}
        name="selectedClassIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select a class</FormLabel>
            <FormControl>
              <Select
                value={field.value?.[0] ? String(field.value[0]) : ''}
                onValueChange={(val) => {
                  const id = Number(val);
                  field.onChange(Number.isFinite(id) ? [id] : []);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {(classes ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.level_group_name} {c.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
