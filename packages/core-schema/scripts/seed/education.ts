import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import { educationAcademicYearTable } from '../../schemas/education/tables/academic_year.ts';
import { educationClassTable } from '../../schemas/education/tables/class.ts';
import { educationLessonTable } from '../../schemas/education/tables/lesson.ts';
import { educationLevelTable } from '../../schemas/education/tables/level.ts';
import { educationLevelGroupTable } from '../../schemas/education/tables/level_group.ts';
import { educationLevelGroupJoinLevelTable } from '../../schemas/education/tables/level_group_join_level.ts';
import { educationStudentTable } from '../../schemas/education/tables/student.ts';
import { educationStudentJoinClassTable } from '../../schemas/education/tables/student_join_class.ts';
import { educationSubjectTable } from '../../schemas/education/tables/subject.ts';
import { educationTermTable } from '../../schemas/education/tables/term.ts';
import { clearTables, type SeedContext } from './utils.ts';

// region Types
export type ClassIds = {
  [key: string]: number;
};

type TermInfo = {
  id: number;
  name: string;
  startDate: { y: number; m: number; d: number };
  endDate: { y: number; m: number; d: number }; // inclusive SGT
};

type LevelIds = { [name: string]: number };
type LevelGroupIds = { [name: string]: number };
type SubjectIds = { [name: string]: number };
// endregion

// region Date helpers
// (SGT -> UTC conversions and weekly iteration)
const SGT_UTC_OFFSET_HOURS = 8;

function toDateRangeStringInclusive(
  start: { y: number; m: number; d: number },
  endInclusive: { y: number; m: number; d: number },
): string {
  const startStr = `${start.y.toString().padStart(4, '0')}-${start.m.toString().padStart(2, '0')}-${start.d.toString().padStart(2, '0')}`;
  const endDate = new Date(
    Date.UTC(endInclusive.y, endInclusive.m - 1, endInclusive.d),
  );
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const y = endDate.getUTCFullYear();
  const m = (endDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = endDate.getUTCDate().toString().padStart(2, '0');
  const endStr = `${y}-${m}-${d}`;
  return `[${startStr},${endStr})`;
}

// Returns 0=Sunday..6=Saturday using UTC calendar
function dayOfWeek(y: number, m: number, d: number): number {
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow;
}

function addDays(date: { y: number; m: number; d: number }, days: number) {
  const dt = new Date(Date.UTC(date.y, date.m - 1, date.d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

function compareDates(
  a: { y: number; m: number; d: number },
  b: { y: number; m: number; d: number },
): number {
  if (a.y !== b.y) return a.y - b.y;
  if (a.m !== b.m) return a.m - b.m;
  return a.d - b.d;
}

function toTstzRangeFromSgt(
  date: { y: number; m: number; d: number },
  startHourSgt: number,
  endHourSgt: number,
): string {
  const startUtc = new Date(
    Date.UTC(
      date.y,
      date.m - 1,
      date.d,
      startHourSgt - SGT_UTC_OFFSET_HOURS,
      0,
      0,
      0,
    ),
  );
  const endUtc = new Date(
    Date.UTC(
      date.y,
      date.m - 1,
      date.d,
      endHourSgt - SGT_UTC_OFFSET_HOURS,
      0,
      0,
      0,
    ),
  );
  const startIso = startUtc.toISOString();
  const endIso = endUtc.toISOString();
  return `[${startIso},${endIso})`;
}

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
type DayNameLiteral = (typeof dayNames)[number];
const DayName: Record<number, DayNameLiteral> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
// endregion

// region Database seeders
function requireId(
  map: Record<string, number | undefined>,
  key: string,
  label: string,
): number {
  const v = map[key];
  if (v === undefined) throw new Error(`Missing ${label} id for '${key}'`);
  return v;
}

async function seedAcademicYear2025() {
  console.log('Academic Year:');
  const ay: InferInsertModel<typeof educationAcademicYearTable> = {
    name: 'Academic Year 2025',
    date_range: toDateRangeStringInclusive(
      { y: 2025, m: 1, d: 1 },
      { y: 2025, m: 12, d: 31 },
    ),
  };
  const [created] = await db
    .insert(educationAcademicYearTable)
    .values(ay)
    .returning();
  if (!created) throw new Error('Failed to create academic year');
  console.log(`   Created academic year id=${created.id}`);
  return created.id;
}

async function seedTerms(academicYearId: number): Promise<TermInfo[]> {
  console.log('Terms:');
  const termsSpec = [
    {
      name: '2025 Term 1',
      start: { y: 2025, m: 1, d: 1 },
      end: { y: 2025, m: 3, d: 31 },
    },
    {
      name: '2025 Term 2',
      start: { y: 2025, m: 4, d: 1 },
      end: { y: 2025, m: 6, d: 30 },
    },
    {
      name: '2025 Term 3',
      start: { y: 2025, m: 7, d: 1 },
      end: { y: 2025, m: 9, d: 30 },
    },
    {
      name: '2025 Term 4',
      start: { y: 2025, m: 10, d: 1 },
      end: { y: 2025, m: 12, d: 31 },
    },
  ] as const;

  const termRows: InferInsertModel<typeof educationTermTable>[] = termsSpec.map(
    (t) => ({
      name: t.name,
      date_range: toDateRangeStringInclusive(t.start, t.end),
      academic_year_id: academicYearId,
    }),
  );

  const created = await db
    .insert(educationTermTable)
    .values(termRows)
    .returning();
  console.log(`   Created ${created.length} terms`);
  return created
    .sort((a, b) => a.id - b.id)
    .map((row) => {
      const spec = termsSpec.find((t) => t.name === row.name);
      if (!spec) throw new Error(`Unexpected term returned: ${row.name}`);
      return {
        id: row.id,
        name: row.name,
        startDate: spec.start,
        endDate: spec.end,
      };
    });
}

async function seedLevels(): Promise<LevelIds> {
  console.log('Levels:');
  const names = [
    'Primary 1',
    'Primary 2',
    'Primary 3',
    'Primary 4',
    'Primary 5',
    'Primary 6',
    'Secondary 1',
    'Secondary 2',
    'Secondary 3',
    'Secondary 4',
  ];
  const rows: InferInsertModel<typeof educationLevelTable>[] = names.map(
    (name) => ({ name }),
  );
  const created = await db.insert(educationLevelTable).values(rows).returning();
  console.log(`   Created ${created.length} levels`);
  const ids: LevelIds = {};
  for (const r of created) {
    ids[r.name] = r.id;
  }
  return ids;
}

async function seedLevelGroups(levelIds: LevelIds): Promise<LevelGroupIds> {
  console.log('Level Groups:');
  // singleton groups for each level + Upper Secondary (Sec 3 & 4)
  const groupNames = [...Object.keys(levelIds), 'Upper Secondary'];
  const groupRows: InferInsertModel<typeof educationLevelGroupTable>[] =
    groupNames.map((name) => ({ name }));
  const groups = await db
    .insert(educationLevelGroupTable)
    .values(groupRows)
    .returning();
  console.log(`   Created ${groups.length} level groups`);

  const groupIds: LevelGroupIds = {};
  for (const g of groups) {
    groupIds[g.name] = g.id;
  }

  // Join rows
  const joinRows: InferInsertModel<typeof educationLevelGroupJoinLevelTable>[] =
    [];
  for (const [name, levelId] of Object.entries(levelIds)) {
    const lgid = groupIds[name];
    if (lgid === undefined)
      throw new Error(`Missing level group id for singleton group '${name}'`);
    joinRows.push({ level_group_id: lgid, level_id: levelId });
  }
  // Upper Secondary = Sec 3 & Sec 4
  {
    const upper = groupIds['Upper Secondary'];
    const s3 = levelIds['Secondary 3'];
    const s4 = levelIds['Secondary 4'];
    if (upper === undefined || s3 === undefined || s4 === undefined)
      throw new Error('Missing IDs for Upper Secondary level group or Sec 3/4');
    joinRows.push(
      { level_group_id: upper, level_id: s3 },
      { level_group_id: upper, level_id: s4 },
    );
  }
  const joins = await db
    .insert(educationLevelGroupJoinLevelTable)
    .values(joinRows)
    .returning();
  console.log(`   Linked ${joins.length} level-group relations`);
  return groupIds;
}

async function seedSubjects(): Promise<SubjectIds> {
  console.log('Subjects:');
  const subjects: InferInsertModel<typeof educationSubjectTable>[] = [
    { name: 'English' },
    { name: 'Math' },
  ];
  const created = await db
    .insert(educationSubjectTable)
    .values(subjects)
    .returning();
  console.log(`   Created ${created.length} subjects`);
  const ids: SubjectIds = {};
  for (const s of created) {
    ids[s.name] = s.id;
  }
  return ids;
}

async function seedClasses(
  levelGroupIds: LevelGroupIds,
  subjectIds: SubjectIds,
): Promise<{
  classIds: ClassIds;
  classSpecs: Array<{
    key: string;
    day: number;
    startSgt: number;
    endSgt: number;
    levelGroupId: number;
    subjectId: number;
  }>;
}> {
  console.log('Classes:');
  // Define classes and usual timings in SGT
  const specs: {
    key: string;
    display: string;
    day: number;
    startSgt: number;
    endSgt: number;
    levelGroupId: number;
    subjectId: number;
  }[] = [
    {
      key: 'PRI_5_ENGLISH',
      display: 'Pri 5 English (Thu, 5–7 P.M.)',
      day: 4, // Thursday (0=Sun..6=Sat)
      startSgt: 17,
      endSgt: 19,
      levelGroupId: requireId(levelGroupIds, 'Primary 5', 'level group'),
      subjectId: requireId(subjectIds, 'English', 'subject'),
    },
    {
      key: 'SEC_3_MATH',
      display: 'Sec 3 Math (Mon, 3–5 P.M.)',
      day: 1, // Monday
      startSgt: 15,
      endSgt: 17,
      levelGroupId: requireId(levelGroupIds, 'Secondary 3', 'level group'),
      subjectId: requireId(subjectIds, 'Math', 'subject'),
    },
    {
      key: 'UPPER_SEC_ENGLISH',
      display: 'Upper Sec English (Sat, 7–9 A.M.)',
      day: 6, // Saturday
      startSgt: 7,
      endSgt: 9,
      levelGroupId: requireId(levelGroupIds, 'Upper Secondary', 'level group'),
      subjectId: requireId(subjectIds, 'English', 'subject'),
    },
  ] as const;

  const rows: InferInsertModel<typeof educationClassTable>[] = specs.map(
    (s) => {
      const dayLit: DayNameLiteral | undefined = DayName[s.day];
      if (!dayLit) throw new Error(`Invalid day for class ${s.key}: ${s.day}`);
      return {
        level_group_id: s.levelGroupId,
        subject_id: s.subjectId,
        usual_day_of_the_week: dayLit,
        usual_start_time_utc: `${String((s.startSgt - SGT_UTC_OFFSET_HOURS + 24) % 24).padStart(2, '0')}:00:00`,
        usual_end_time_utc: `${String((s.endSgt - SGT_UTC_OFFSET_HOURS + 24) % 24).padStart(2, '0')}:00:00`,
      };
    },
  );

  const created = await db.insert(educationClassTable).values(rows).returning();
  console.log(`   Created ${created.length} classes`);
  const classIds: ClassIds = {};
  if (created.length !== specs.length)
    throw new Error(`Expected ${specs.length} classes, got ${created.length}`);
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const row = created[i];
    if (!spec || !row) throw new Error('Class creation/spec mismatch');
    classIds[spec.key] = row.id;
  }

  return {
    classIds,
    classSpecs: specs.map((s) => ({
      key: s.key,
      day: s.day,
      startSgt: s.startSgt,
      endSgt: s.endSgt,
      levelGroupId: s.levelGroupId,
      subjectId: s.subjectId,
    })),
  };
}

async function seedWeeklyLessons(
  terms: TermInfo[],
  classes: {
    key: string;
    id: number;
    day: number;
    startSgt: number;
    endSgt: number;
    levelGroupId: number;
    subjectId: number;
  }[],
): Promise<number> {
  console.log('Lessons:');
  const lessonRows: InferInsertModel<typeof educationLessonTable>[] = [];

  for (const term of terms) {
    for (const cls of classes) {
      // find first SGT date in term that matches cls.day
      const startDow = dayOfWeek(
        term.startDate.y,
        term.startDate.m,
        term.startDate.d,
      );
      const offset = (cls.day - startDow + 7) % 7;
      let cursor = addDays(term.startDate, offset);
      while (compareDates(cursor, term.endDate) <= 0) {
        const range = toTstzRangeFromSgt(cursor, cls.startSgt, cls.endSgt);
        lessonRows.push({
          time: range,
          level_group_id: cls.levelGroupId,
          subject_id: cls.subjectId,
          term_id: term.id,
          class_id: cls.id,
        });
        cursor = addDays(cursor, 7);
      }
    }
  }

  const created = await db
    .insert(educationLessonTable)
    .values(lessonRows)
    .returning();
  console.log(`   Created ${created.length} lessons`);
  return created.length;
}
/** Seeds three students and enrolls them in 1, 2, and 3 classes respectively. */
async function seedStudents(classIds: ClassIds) {
  console.log('Students:');
  const students: InferInsertModel<typeof educationStudentTable>[] = [
    {
      name: 'Alice Tan',
      school: 'Raffles Institution',
      phone: '+65 9123 4567',
      email: 'alice.tan@lioncity.edu.sg',
    },
    {
      name: 'Bob Lim',
      school: 'Anglo-Chinese School (Independent)',
      phone: '+65 9876 5432',
      email: 'bob.lim@lioncity.edu.sg',
    },
    {
      name: 'Charlie Ng',
      school: 'Hwa Chong Institution',
      phone: '+65 8765 4321',
      email: 'charlie.ng@lioncity.edu.sg',
    },
  ];

  const created = await db
    .insert(educationStudentTable)
    .values(students)
    .returning();
  if (created.length !== students.length) {
    throw new Error(
      `Expected ${students.length} students, got ${created.length}`,
    );
  }
  console.log(`   Created ${created.length} students`);
  const [alice, bob, charlie] = created;
  if (!alice || !bob || !charlie)
    throw new Error('Missing created student rows');

  // Enrollments: Alice -> 1 class; Bob -> 2 classes; Charlie -> 3 classes
  const pri5Eng = requireId(classIds, 'PRI_5_ENGLISH', 'class');
  const sec3Math = requireId(classIds, 'SEC_3_MATH', 'class');
  const upperSecEng = requireId(classIds, 'UPPER_SEC_ENGLISH', 'class');

  const joinRows: InferInsertModel<typeof educationStudentJoinClassTable>[] = [
    // Alice Tan
    { student_id: alice.id, class_id: pri5Eng },
    // Bob Lim
    { student_id: bob.id, class_id: pri5Eng },
    { student_id: bob.id, class_id: sec3Math },
    // Charlie Ng
    { student_id: charlie.id, class_id: pri5Eng },
    { student_id: charlie.id, class_id: sec3Math },
    { student_id: charlie.id, class_id: upperSecEng },
  ];

  const enrollments = await db
    .insert(educationStudentJoinClassTable)
    .values(joinRows)
    .returning();
  console.log(`   Enrolled ${enrollments.length} student-class relations`);
}
// endregion

// region Drivers
export async function seedEducationData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== EDUCATION DATA ===');

  // 1) Academic Year
  const ayId = await seedAcademicYear2025();

  // 2) Terms
  const terms = await seedTerms(ayId);

  // 3) Levels
  const levelIds = await seedLevels();

  // 4) Level Groups (singleton + Upper Secondary)
  const levelGroupIds = await seedLevelGroups(levelIds);

  // 5) Subjects
  const subjectIds = await seedSubjects();

  // 6) Classes with usual SGT timings stored as UTC times
  const { classIds, classSpecs } = await seedClasses(levelGroupIds, subjectIds);

  // 7) Weekly Lessons for each term and class
  const classesForLessons = classSpecs.map((spec) => {
    const id = classIds[spec.key];
    if (!id) throw new Error(`Missing class id for ${spec.key}`);
    return {
      key: spec.key,
      id,
      day: spec.day,
      startSgt: spec.startSgt,
      endSgt: spec.endSgt,
      levelGroupId: spec.levelGroupId,
      subjectId: spec.subjectId,
    };
  });
  await seedWeeklyLessons(terms, classesForLessons);

  // 8) Students and enrollments
  await seedStudents(classIds);

  context = {
    ...context,
    classIds,
  };

  console.log('=== EDUCATION DATA SEEDING COMPLETE ===\n');
  return context;
}

export async function clearEducationData(): Promise<void> {
  console.log('Clearing education data...');
  await clearTables(
    educationLessonTable,
    educationClassTable,
    educationLevelGroupJoinLevelTable,
    educationLevelGroupTable,
    educationLevelTable,
    educationSubjectTable,
    educationTermTable,
    educationAcademicYearTable,
  );
  console.log('Education data cleared successfully\n');
}
// endregion
