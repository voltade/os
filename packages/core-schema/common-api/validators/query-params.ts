import type { PgTable } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { paginationValidator } from '../utils/pagination.ts';

function preprocessQueryParams(
  params: Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: Generic Zod schema type required for runtime type inspection. The function needs to access schema.shape and perform instanceof checks on field types, which requires the flexible typing that ZodObject<any> provides. Using more specific types would break the dynamic schema introspection needed for automatic type conversion.
  schema: z.ZodObject<any>,
) {
  const processed = { ...params };

  for (const [key, value] of Object.entries(processed)) {
    if (typeof value === 'string' && value !== '') {
      const fieldSchema = schema.shape[key];
      const innerSchema =
        fieldSchema instanceof z.ZodOptional
          ? fieldSchema.unwrap()
          : fieldSchema;

      if (innerSchema instanceof z.ZodNumber) {
        const num = Number(value);
        if (!Number.isNaN(num)) {
          processed[key] = num;
        }
      }

      if (innerSchema instanceof z.ZodBoolean) {
        processed[key] = value === 'true' || value === '1';
      }
    }
  }

  return processed;
}

export function createQueryHandler<T extends PgTable>(
  table: T,
  options: {
    omit?: Record<string, true>;
    extend?: z.ZodRawShape;
  } = {},
) {
  const tableSchema = createSelectSchema(table)
    .partial()
    .omit(options.omit || {});

  const fullSchema = z.object({
    ...tableSchema.shape,
    ...paginationValidator.shape,
    ...options.extend,
  });

  return {
    schema: fullSchema,
    validate: (rawParams: Record<string, unknown>) => {
      const processed = preprocessQueryParams(rawParams, fullSchema);
      return fullSchema.parse(processed);
    },
    safeParse: (rawParams: Record<string, unknown>) => {
      const processed = preprocessQueryParams(rawParams, fullSchema);
      return fullSchema.safeParse(processed);
    },
  };
}
