import type { Command } from 'commander';

export * from './environments.ts';

export function getFinalOptions<T>(command: Command) {
  return {
    ...(command.parent?.opts ? command.parent?.opts() : {}),
    ...(command.opts ? command.opts() : {}),
  } as T;
}
