import { and, eq, ilike, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

export function buildWhereClause<T extends PgTable>(
  table: T,
  // biome-ignore lint/suspicious/noExplicitAny: Validator parameter accepts multiple Zod schema types (ZodObject, ZodIntersection, extended schemas) from different table configurations. Using specific Zod typing would require complex generic constraints that would break compatibility with the createQueryHandler utility and other schema builders. The function safely accesses validator.shape with runtime checks.
  validator: any,
  filters: Record<string, unknown>,
): SQL | undefined {
  const conditions: SQL[] = [];

  const validatorShape = validator.shape || {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      key === 'page' ||
      key === 'limit' ||
      !value ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return;
    }

    if (!(key in validatorShape)) {
      return;
    }

    if (key in table) {
      const column = (table as Record<string, unknown>)[key];

      if (
        column &&
        typeof column === 'object' &&
        'name' in column &&
        'columnType' in column
      ) {
        const zodField = validatorShape[key];
        const isNumberField = zodField ? isZodNumberType(zodField) : false;

        if (
          isNumberField &&
          (typeof value === 'string' || typeof value === 'number')
        ) {
          const numericValue =
            typeof value === 'string' ? Number(value) : value;
          if (!Number.isNaN(numericValue)) {
            conditions.push(
              eq(column as unknown as Parameters<typeof eq>[0], numericValue),
            );
          }
        } else if (typeof value === 'string' && value.trim() !== '') {
          conditions.push(
            ilike(
              column as unknown as Parameters<typeof ilike>[0],
              `%${value.trim()}%`,
            ),
          );
        }
      }
    }
  });

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
}

function isZodNumberType(zodType: unknown): boolean {
  try {
    if (
      typeof zodType !== 'object' ||
      zodType === null ||
      !('safeParse' in zodType)
    ) {
      return false;
    }

    const zodSchema = zodType as {
      safeParse: (value: unknown) => { success: boolean };
    };
    const numberTest = zodSchema.safeParse(123);
    const stringTest = zodSchema.safeParse('not-a-number');

    return numberTest.success && !stringTest.success;
  } catch {
    return false;
  }
}
