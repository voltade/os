import React from 'react';

interface LoadingProps {
  message?: string;
  fullHeight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({
  message,
  fullHeight = false,
  size = 'md',
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  return (
    <div
      className={[
        'flex items-center justify-center gap-3',
        fullHeight ? 'h-[50vh]' : 'py-6',
      ].join(' ')}
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className={[
          sizeClasses,
          'animate-spin rounded-full border-2 border-muted-foreground border-t-transparent',
        ].join(' ')}
      />
      {message ? (
        <span className="text-sm text-muted-foreground">{message}</span>
      ) : null}
    </div>
  );
}
