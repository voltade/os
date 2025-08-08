import type { Command } from 'commander';

export * from './environments.ts';

export function getFinalOptions<T>(command: Command) {
  return {
    ...(command.optsWithGlobals ? command.optsWithGlobals() : {}),
  } as T;
}
