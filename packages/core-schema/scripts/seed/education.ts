import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import { educationClassTable } from '../../schemas/education/tables/class.ts';
import type { SeedContext } from './utils.ts';

// region Types
export type ClassIds = {
  [key: string]: number;
};
// endregion

// region Database
/**
 * Seeds classes for the education schema.
 */
async function seedClasses(): Promise<ClassIds> {
  console.log('Classes:');

  const classData: InferInsertModel<typeof educationClassTable>[] = [
    { temporary_name: 'Pri 5 English (Thu, 5–7 P.M.)' },
    { temporary_name: 'Sec 3 Math (Mon, 3–5 P.M.)' },
    { temporary_name: 'Upper Sec English (Sat, 10 A.M.–12 P.M.)' },
  ];

  const classes = await db
    .insert(educationClassTable)
    .values(classData)
    .returning();
  console.log(`   Created ${classes.length} classes`);
  if (classes.length !== classData.length)
    console.warn(
      `   Warning: Expected ${classData.length} classes ` +
        `but got ${classes.length} classes`,
    );

  const classIds: ClassIds = classes.reduce<ClassIds>((acc, cls) => {
    // biome-ignore lint/style/noNonNullAssertion: temporary_name is always defined in classData.
    acc[cls.temporary_name!.replace(/\s+/g, '_').toUpperCase()] = cls.id;
    return acc;
  }, {});

  return classIds;
}
// endregion

// region Drivers
/**
 * Seeds education data (only classes).
 *
 * @param context - The seed context to update with created IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedEducationData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== EDUCATION DATA ===');

  const classIds = await seedClasses();

  context = {
    ...context,
    classIds,
  };

  console.log('=== EDUCATION DATA SEEDING COMPLETE ===\n');
  return context;
}

/**
 * Clears all education-related data from the database.
 */
export async function clearEducationData(): Promise<void> {
  console.log('Clearing education data...');

  await db.delete(educationClassTable);

  console.log('Education data cleared successfully');
}
// endregion
