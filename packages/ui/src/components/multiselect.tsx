import { ChevronDownIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '#lib/utils.ts';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx';

export type MultiSelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type MultiSelectProps = {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'default';
  disabled?: boolean;
};

export function MultiSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  className,
  size = 'default',
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSet = React.useMemo(() => new Set(value), [value]);
  const selectedOptions = React.useMemo(
    () => options.filter((o) => selectedSet.has(o.value)),
    [options, selectedSet],
  );

  const toggleValue = (v: string, checked: boolean) => {
    if (checked) {
      if (!selectedSet.has(v)) onValueChange([...value, v]);
    } else {
      if (selectedSet.has(v)) onValueChange(value.filter((x) => x !== v));
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          data-slot="select-trigger"
          data-size={size}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-background dark:bg-input/30 dark:hover:bg-input/50 flex w-full max-w-lg flex-wrap items-center justify-start gap-1 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:min-h-9 data-[size=sm]:min-h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className,
          )}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-muted-foreground whitespace-nowrap">
              {placeholder}
            </span>
          ) : (
            <span className="flex w-[calc(100%-1.5rem)] flex-wrap items-center gap-1">
              {selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-full border bg-secondary text-secondary-foreground px-2 py-0.5 text-xs"
                >
                  <span>{opt.label}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${typeof opt.label === 'string' ? opt.label : opt.value}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleValue(opt.value, false);
                    }}
                    onPointerDown={(e) => {
                      // Prevent Radix trigger from toggling open state
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleValue(opt.value, false);
                      }
                    }}
                    className="text-muted-foreground/80 hover:text-foreground inline-flex items-center"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </span>
              ))}
            </span>
          )}
          <span className="ml-auto inline-flex items-center">
            <ChevronDownIcon className="size-4 opacity-50" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-md border p-1 shadow-md">
        {options.map((opt) => {
          const checked = selectedSet.has(opt.value);
          return (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={checked}
              onCheckedChange={(c) => toggleValue(opt.value, Boolean(c))}
              // Prevent menu from closing when toggling items
              onSelect={(e) => e.preventDefault()}
              disabled={opt.disabled}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MultiSelect;
