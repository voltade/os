import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { InferInsertModel } from 'drizzle-orm';
import { inArray } from 'drizzle-orm';

import { db } from '../../../lib/db.ts';
import { educationClassTable } from '../../../schemas/education/tables/class.ts';
import { educationLevelGroupTable } from '../../../schemas/education/tables/level_group.ts';
import { educationParentTable } from '../../../schemas/education/tables/parent.ts';
import { educationStudentTable } from '../../../schemas/education/tables/student.ts';
import { educationStudentJoinParentTable } from '../../../schemas/education/tables/student_join_parent.ts';
import { educationSubjectTable } from '../../../schemas/education/tables/subject.ts';
import type { Class } from './types/class.ts';
import type { Student } from './types/student.ts';

export async function migrateFromJson(): Promise<void> {
  console.log('Starting migration from JSON files...');

  try {
    // Read JSON files
    const classesPath = join(
      process.cwd(),
      'data',
      'education',
      'classes.json',
    );
    const studentsPath = join(
      process.cwd(),
      'data',
      'education',
      'students.json',
    );

    const classesData = JSON.parse(
      await readFile(classesPath, 'utf-8'),
    ) as Class[];
    const studentsData = JSON.parse(
      await readFile(studentsPath, 'utf-8'),
    ) as Student[];

    console.log(
      `Loaded ${classesData.length} classes and ${studentsData.length} students from JSON`,
    );

    // First, create subjects and level groups from class data
    const subjectIds = await createSubjects(classesData);
    const levelGroupIds = await createLevelGroups(classesData);

    // Migrate students and parents
    await migrateStudents(studentsData);

    // Migrate classes
    await migrateClasses(classesData, subjectIds, levelGroupIds);

    console.log('Migration from JSON files completed successfully');
  } catch (error) {
    console.error('Error during JSON migration:', error);
    throw error;
  }
}

async function migrateStudents(studentsData: Student[]): Promise<void> {
  console.log('Migrating students and parents...');

  for (const studentData of studentsData) {
    // Create parents first
    const parentIds: number[] = [];
    for (const parentData of studentData.parents) {
      const parentRow: InferInsertModel<typeof educationParentTable> = {
        name: parentData.name,
        email: parentData.email,
        phone: parentData.phone,
      };

      const [createdParent] = await db
        .insert(educationParentTable)
        .values(parentRow)
        .returning();

      if (createdParent) {
        parentIds.push(createdParent.id);
      }
    }

    // Create student
    const studentRow: InferInsertModel<typeof educationStudentTable> = {
      name: studentData.name,
      email: studentData.email,
      school: studentData.school,
      phone: studentData.phone,
    };

    const [createdStudent] = await db
      .insert(educationStudentTable)
      .values(studentRow)
      .returning();

    if (createdStudent) {
      // Link student to parents
      for (const parentId of parentIds) {
        const joinRow: InferInsertModel<
          typeof educationStudentJoinParentTable
        > = {
          student_id: createdStudent.id,
          parent_id: parentId,
          relationship: 'parent', // Default relationship
        };

        await db.insert(educationStudentJoinParentTable).values(joinRow);
      }
    }
  }

  console.log(`   Migrated ${studentsData.length} students with their parents`);
}

async function createSubjects(
  classesData: Class[],
): Promise<Record<string, number>> {
  console.log('Creating subjects...');

  // Extract unique subjects from class data
  const uniqueSubjects = [...new Set(classesData.map((c) => c.subject))];

  const subjectRows: InferInsertModel<typeof educationSubjectTable>[] =
    uniqueSubjects.map((name) => ({ name }));

  const created = await db
    .insert(educationSubjectTable)
    .values(subjectRows)
    .onConflictDoNothing()
    .returning();

  console.log(`   Created/found ${created.length} subjects`);

  // Create a map of subject name to ID
  const subjectIds: Record<string, number> = {};
  for (const subject of created) {
    subjectIds[subject.name] = subject.id;
  }

  // For subjects that already existed (conflict), we need to fetch their IDs
  const existingSubjects = await db
    .select()
    .from(educationSubjectTable)
    .where(inArray(educationSubjectTable.name, uniqueSubjects));

  for (const subject of existingSubjects) {
    if (!subjectIds[subject.name]) {
      subjectIds[subject.name] = subject.id;
    }
  }

  return subjectIds;
}

async function createLevelGroups(
  classesData: Class[],
): Promise<Record<string, number>> {
  console.log('Creating level groups...');

  // Extract unique level groups from class data
  const uniqueLevelGroups = [...new Set(classesData.map((c) => c.levelGroup))];

  const levelGroupRows: InferInsertModel<typeof educationLevelGroupTable>[] =
    uniqueLevelGroups.map((name) => ({ name }));

  const created = await db
    .insert(educationLevelGroupTable)
    .values(levelGroupRows)
    .onConflictDoNothing()
    .returning();

  console.log(`   Created/found ${created.length} level groups`);

  // Create a map of level group name to ID
  const levelGroupIds: Record<string, number> = {};
  for (const levelGroup of created) {
    levelGroupIds[levelGroup.name] = levelGroup.id;
  }

  // For level groups that already existed (conflict), we need to fetch their IDs
  const existingLevelGroups = await db
    .select()
    .from(educationLevelGroupTable)
    .where(inArray(educationLevelGroupTable.name, uniqueLevelGroups));

  for (const levelGroup of existingLevelGroups) {
    if (!levelGroupIds[levelGroup.name]) {
      levelGroupIds[levelGroup.name] = levelGroup.id;
    }
  }

  return levelGroupIds;
}

async function migrateClasses(
  classesData: Class[],
  subjectIds: Record<string, number>,
  levelGroupIds: Record<string, number>,
): Promise<void> {
  console.log('Migrating classes...');

  // Note: This assumes that subjects, level groups, branches, and classrooms already exist
  // In a real migration, you might need to create these first or look them up

  for (const classData of classesData) {
    // Convert time format from "9:00 am" to "09:00:00"
    const startTime = convertTimeFormat(classData.startTime);
    const endTime = convertTimeFormat(classData.endTime);

    // Convert day to enum format expected by database
    const dayOfWeek = convertDayFormat(classData.day);

    const subjectId = subjectIds[classData.subject];
    if (!subjectId) {
      throw new Error(`Subject not found: ${classData.subject}`);
    }

    const levelGroupId = levelGroupIds[classData.levelGroup];
    if (!levelGroupId) {
      throw new Error(`Level group not found: ${classData.levelGroup}`);
    }

    const classRow: InferInsertModel<typeof educationClassTable> = {
      subject_id: subjectId,
      level_group_id: levelGroupId,
      usual_day_of_the_week: dayOfWeek,
      usual_start_time_utc: startTime,
      usual_end_time_utc: endTime,
      // These would need to be looked up from existing data or created
      // usual_classroom_id: await getClassroomId(classData.classroom),
    };

    await db.insert(educationClassTable).values(classRow).returning();

    console.log(
      `   Created class: ${classData.subject} - ${classData.levelGroup}`,
    );
  }

  console.log(`   Migrated ${classesData.length} classes`);
}

function convertTimeFormat(time: string): string {
  // Convert "9:00 am" or "9 am" to "09:00:00"
  const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const hoursStr = match[1];
  const minutesStr = match[2];
  const periodStr = match[3];

  if (!hoursStr || !periodStr) {
    throw new Error(`Invalid time format: ${time}`);
  }

  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
  const period = periodStr.toLowerCase();

  if (period === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}

function convertDayFormat(
  day: string,
):
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday' {
  // Convert "Mon" to "Monday" format expected by the enum
  const dayMap: Record<
    string,
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'
  > = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  };

  const converted = dayMap[day];
  if (!converted) {
    throw new Error(`Invalid day format: ${day}`);
  }
  return converted;
}
