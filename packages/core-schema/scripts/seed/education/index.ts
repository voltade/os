import type { InferInsertModel } from 'drizzle-orm';
import { and, eq, inArray } from 'drizzle-orm';

import { db } from '../../../lib/db.ts';
import { accountTable } from '../../../schemas/accounting/tables/account.ts';
import { journalTable } from '../../../schemas/accounting/tables/journal.ts';
import { journalEntryTable } from '../../../schemas/accounting/tables/journal_entry.ts';
import { journalLineTable } from '../../../schemas/accounting/tables/journal_line.ts';
import { educationAcademicYearTable } from '../../../schemas/education/tables/academic_year.ts';
import { educationAttendanceTable } from '../../../schemas/education/tables/attendance.ts';
import { educationBranchTable } from '../../../schemas/education/tables/branch.ts';
import { educationClassTable } from '../../../schemas/education/tables/class.ts';
import { educationClassroomTable } from '../../../schemas/education/tables/classroom.ts';
import { educationLessonTable } from '../../../schemas/education/tables/lesson.ts';
import { educationLevelTable } from '../../../schemas/education/tables/level.ts';
import { educationLevelGroupTable } from '../../../schemas/education/tables/level_group.ts';
import { educationLevelGroupJoinLevelTable } from '../../../schemas/education/tables/level_group_join_level.ts';
import { educationStudentTable } from '../../../schemas/education/tables/student.ts';
import { educationStudentJoinClassTable } from '../../../schemas/education/tables/student_join_class.ts';
import { educationSubjectTable } from '../../../schemas/education/tables/subject.ts';
import { educationTermTable } from '../../../schemas/education/tables/term.ts';
import { currencyTable } from '../../../schemas/resource/tables/currency.ts';
import { clearTables, type SeedContext } from '../utils.ts';
import { migrateFromJson } from './migrate.ts';

// region Types
export type ClassIds = {
  [key: string]: number;
};

type BranchIds = { [name: string]: number };
type ClassroomIds = { [name: string]: number };

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

async function seedBranches(): Promise<BranchIds> {
  console.log('Branches:');
  const branches: InferInsertModel<typeof educationBranchTable>[] = [
    { name: 'Tampines' },
    { name: 'Jurong' },
  ];
  const created = await db
    .insert(educationBranchTable)
    .values(branches)
    .returning();
  console.log(`   Created ${created.length} branches`);
  const ids: BranchIds = {};
  for (const b of created) {
    if (!b.name) continue;
    ids[b.name] = b.id;
  }
  return ids;
}

async function seedClassrooms(branchIds: BranchIds): Promise<ClassroomIds> {
  console.log('Classrooms:');
  const tampinesId = requireId(branchIds, 'Tampines', 'branch');
  const jurongId = requireId(branchIds, 'Jurong', 'branch');

  const classrooms: InferInsertModel<typeof educationClassroomTable>[] = [
    // Tampines
    { name: 'Tampines Classroom 1', capacity: 10, branch_id: tampinesId },
    { name: 'Tampines Classroom 2', capacity: 15, branch_id: tampinesId },
    { name: 'Tampines Classroom 3', capacity: 20, branch_id: tampinesId },
    // Jurong
    { name: 'Jurong Classroom 1', capacity: 10, branch_id: jurongId },
    { name: 'Jurong Classroom 2', capacity: 15, branch_id: jurongId },
    { name: 'Jurong Classroom 3', capacity: 20, branch_id: jurongId },
  ];
  const created = await db
    .insert(educationClassroomTable)
    .values(classrooms)
    .returning();
  console.log(`   Created ${created.length} classrooms`);
  const ids: ClassroomIds = {};
  for (const c of created) {
    if (!c.name) continue;
    ids[c.name] = c.id;
  }
  return ids;
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
  classroomIds: ClassroomIds,
): Promise<{
  classIds: ClassIds;
  classSpecs: Array<{
    key: string;
    day: number;
    startSgt: number;
    endSgt: number;
    levelGroupId: number;
    subjectId: number;
    classroomId: number;
    usualLessonPriceSgd: number;
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
    classroomId: number;
    usualLessonPriceSgd: number;
  }[] = [
    {
      key: 'PRI_5_ENGLISH',
      display: 'Pri 5 English (Thu, 5–7 P.M.)',
      day: 4, // Thursday (0=Sun..6=Sat)
      startSgt: 17,
      endSgt: 19,
      levelGroupId: requireId(levelGroupIds, 'Primary 5', 'level group'),
      subjectId: requireId(subjectIds, 'English', 'subject'),
      classroomId: requireId(classroomIds, 'Tampines Classroom 1', 'classroom'),
      usualLessonPriceSgd: 50,
    },
    {
      key: 'SEC_3_MATH',
      display: 'Sec 3 Math (Mon, 3–5 P.M.)',
      day: 1, // Monday
      startSgt: 15,
      endSgt: 17,
      levelGroupId: requireId(levelGroupIds, 'Secondary 3', 'level group'),
      subjectId: requireId(subjectIds, 'Math', 'subject'),
      classroomId: requireId(classroomIds, 'Tampines Classroom 2', 'classroom'),
      usualLessonPriceSgd: 60,
    },
    {
      key: 'UPPER_SEC_ENGLISH',
      display: 'Upper Sec English (Sat, 7–9 A.M.)',
      day: 6, // Saturday
      startSgt: 7,
      endSgt: 9,
      levelGroupId: requireId(levelGroupIds, 'Upper Secondary', 'level group'),
      subjectId: requireId(subjectIds, 'English', 'subject'),
      classroomId: requireId(classroomIds, 'Jurong Classroom 1', 'classroom'),
      usualLessonPriceSgd: 70,
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
        usual_classroom_id: s.classroomId,
        usual_lesson_price_sgd: String(s.usualLessonPriceSgd),
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
      classroomId: s.classroomId,
      usualLessonPriceSgd: s.usualLessonPriceSgd,
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
    classroomId: number;
    usualLessonPriceSgd: number;
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
          classroom_id: cls.classroomId,
          price_sgd: String(cls.usualLessonPriceSgd),
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
      // email: 'alice.tan@lioncity.edu.sg',
    },
    {
      name: 'Bob Lim',
      school: 'Anglo-Chinese School (Independent)',
      phone: '+65 9876 5432',
      // email: 'bob.lim@lioncity.edu.sg',
    },
    {
      name: 'Charlie Ng',
      school: 'Hwa Chong Institution',
      phone: '+65 8765 4321',
      // email: 'charlie.ng@lioncity.edu.sg',
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

  return { students: created };
}
// endregion

async function seedAttendance() {
  console.log('Attendance:');
  // Fetch all lessons (with class_id) and all enrollments.
  const lessons = await db.select().from(educationLessonTable);
  const enrollments = await db.select().from(educationStudentJoinClassTable);

  // Group lessons by class_id for quick lookup.
  const lessonsByClass = new Map<number, number[]>();
  for (const l of lessons) {
    if (l.class_id) {
      const arr = lessonsByClass.get(l.class_id) ?? [];
      arr.push(l.id);
      lessonsByClass.set(l.class_id, arr);
    }
  }

  const attendanceRows: InferInsertModel<typeof educationAttendanceTable>[] =
    [];
  for (const e of enrollments) {
    const lessonIds = lessonsByClass.get(e.class_id);
    if (!lessonIds) continue; // No lessons associated (should not happen in this seed scenario)
    for (const lessonId of lessonIds) {
      attendanceRows.push({
        student_id: e.student_id,
        lesson_id: lessonId,
        // Defaults: is_paid_for defaults false, mark all as non-trial and present.
        is_trial: false,
        status: 'present',
      });
    }
  }

  if (attendanceRows.length === 0) {
    console.log('   No attendance rows to insert');
    return 0;
  }

  const inserted = await db
    .insert(educationAttendanceTable)
    .values(attendanceRows)
    .returning();
  console.log(`   Created ${inserted.length} attendance records`);
  return inserted.length;
}

// Seed a sample invoice (journal entry + lines) for Bob Lim's classes.
async function seedEducationInvoice(classIds: ClassIds) {
  console.log('Invoice:');
  // Look up Sales Invoice journal
  const [salesJournal] = await db
    .select()
    .from(journalTable)
    .where(eq(journalTable.name, 'Sales Invoice'))
    .limit(1);
  if (!salesJournal) {
    console.warn(
      '   Sales Invoice journal not found; skipping invoice seeding',
    );
    return;
  }

  // Look up SGD currency (assumes code column present)
  const [sgdCurrency] = await db
    .select()
    .from(currencyTable)
    .where(eq(currencyTable.name, 'SGD'))
    .limit(1);
  if (!sgdCurrency) {
    console.warn('   SGD currency not found; skipping invoice seeding');
    return;
  }

  // Look up accounts
  const accounts = await db.select().from(accountTable);
  const revenueAccount = accounts.find((a) => a.name === 'Revenue');
  const arAccount = accounts.find((a) => a.name === 'Accounts Receivable');
  if (!revenueAccount || !arAccount) {
    console.warn(
      '   Revenue or Accounts Receivable account missing; skipping invoice seeding',
    );
    return;
  }

  // Required class references
  const pri5ClassId = classIds['PRI_5_ENGLISH'];
  const sec3ClassId = classIds['SEC_3_MATH'];
  if (!pri5ClassId || !sec3ClassId) {
    console.warn('   Required class IDs missing; skipping invoice seeding');
    return;
  }

  // Create journal entry
  const entryRows: InferInsertModel<typeof journalEntryTable>[] = [
    {
      journal_id: salesJournal.id,
      currency_id: sgdCurrency.id,
      partner_id: null, // TODO: Link Student #2 (Bob Lim) to a resource.partner
      contact_id: null,
      name: 'INV2025/0001',
      type: 'Customer Invoice',
      date: '2025-09-01',
      description: '', // Empty per requirement
      status: 'Posted',
      origin: '', // Empty string per clarification
    },
  ];

  const [invoice] = await db
    .insert(journalEntryTable)
    .values(entryRows)
    .returning();
  if (!invoice) {
    console.warn('   Failed to create invoice journal entry');
    return;
  }

  // Prepare line data
  const line1Total = 13 * 50; // 650
  const line2Total = 13 * 60; // 780
  const total = line1Total + line2Total; // 1430

  const lineRows: InferInsertModel<typeof journalLineTable>[] = [
    {
      journal_entry_id: invoice.id,
      own_entity_id: -1, // TODO: Determine correct own_entity_id
      partner_id: null,
      contact_id: null,
      date: '2025-09-01',
      reference_id: pri5ClassId,
      reference_type: 'education.class',
      quantity: 13,
      unit_price: String(50),
      subtotal_price: String(line1Total),
      total_price: String(line1Total),
      sequence_number: 1,
      name: 'Primary 5 English (Thursdays, 5 PM–7 PM @ Tampines)',
      description: 'TODO: Get lesson dates.',
      credit: String(line1Total),
      debit: '0',
      account_id: revenueAccount.id,
    },
    {
      journal_entry_id: invoice.id,
      own_entity_id: -1,
      partner_id: null,
      contact_id: null,
      date: '2025-09-01',
      reference_id: sec3ClassId,
      reference_type: 'education.class',
      quantity: 13,
      unit_price: String(60),
      subtotal_price: String(line2Total),
      total_price: String(line2Total),
      sequence_number: 2,
      name: 'Secondary 3 Math (Mondays, 3 PM–5 PM @ Tampines)',
      description: 'TODO: Get lesson dates.',
      credit: String(line2Total),
      debit: '0',
      account_id: revenueAccount.id,
    },
    {
      journal_entry_id: invoice.id,
      own_entity_id: -1,
      partner_id: null,
      contact_id: null,
      date: '2025-09-01',
      quantity: 0,
      unit_price: '0',
      subtotal_price: '0',
      total_price: '0',
      sequence_number: 3,
      name: 'Accounts Receivable',
      description: '',
      credit: '0',
      debit: String(total),
      account_id: arAccount.id,
    },
  ];

  const insertedLines = await db
    .insert(journalLineTable)
    .values(lineRows)
    .returning();
  console.log(
    `   Created invoice ${invoice.name} with ${insertedLines.length} lines`,
  );

  // Link Bob Lim's Term 1 attendance for the two classes to the respective journal lines.
  try {
    // Fetch Bob Lim
    const [bob] = await db
      .select()
      .from(educationStudentTable)
      .where(eq(educationStudentTable.name, 'Bob Lim'))
      .limit(1);
    if (!bob) {
      console.warn('   Bob Lim not found; skipping attendance linkage');
      return;
    }

    // Identify Term 1 id (earliest term by id for the 2025 academic year)
    const [term1] = await db
      .select()
      .from(educationTermTable)
      .where(eq(educationTermTable.name, '2025 Term 1'))
      .limit(1);
    if (!term1) {
      console.warn('   Term 1 not found; skipping attendance linkage');
      return;
    }

    // Get Term 1 lesson ids for each class only
    const pri5Term1Lessons = await db
      .select({ id: educationLessonTable.id })
      .from(educationLessonTable)
      .where(
        and(
          eq(educationLessonTable.class_id, pri5ClassId),
          eq(educationLessonTable.term_id, term1.id),
        ),
      );
    const sec3Term1Lessons = await db
      .select({ id: educationLessonTable.id })
      .from(educationLessonTable)
      .where(
        and(
          eq(educationLessonTable.class_id, sec3ClassId),
          eq(educationLessonTable.term_id, term1.id),
        ),
      );

    const pri5LessonIds = pri5Term1Lessons.map((l) => l.id);
    const sec3LessonIds = sec3Term1Lessons.map((l) => l.id);

    const line1 = insertedLines.find((l) => l.sequence_number === 1);
    const line2 = insertedLines.find((l) => l.sequence_number === 2);
    if (!line1 || !line2) {
      console.warn('   Missing revenue lines; cannot link attendance');
      return;
    }

    // Update attendance rows for Bob where lesson belongs to each class; restrict to Term 1 by checking lesson_id set (Term 1 lesson ids start first chronologically already but we use all lessons for simplicity)
    if (pri5LessonIds.length > 0) {
      await db
        .update(educationAttendanceTable)
        .set({ journal_line_id: line1.id })
        .where(
          and(
            eq(educationAttendanceTable.student_id, bob.id),
            inArray(educationAttendanceTable.lesson_id, pri5LessonIds),
          ),
        );
    }
    if (sec3LessonIds.length > 0) {
      await db
        .update(educationAttendanceTable)
        .set({ journal_line_id: line2.id })
        .where(
          and(
            eq(educationAttendanceTable.student_id, bob.id),
            inArray(educationAttendanceTable.lesson_id, sec3LessonIds),
          ),
        );
    }
    console.log("   Linked Bob's Term 1 attendances to journal lines");
  } catch (err) {
    console.warn('   Failed to link attendance to invoice lines:', err);
  }
}

// region Drivers
export async function seedEducationData(
  context: SeedContext,
  migrate: boolean = false,
): Promise<SeedContext> {
  console.log('=== EDUCATION DATA ===');

  // 1) Branches
  const branchIds = await seedBranches();

  // 2) Classrooms
  const classroomIds = await seedClassrooms(branchIds);

  // 3) Academic Year
  const ayId = await seedAcademicYear2025();

  // 4) Terms
  const terms = await seedTerms(ayId);

  // 5) Levels
  const levelIds = await seedLevels();

  // 6) Level Groups (singleton + Upper Secondary)
  const levelGroupIds = await seedLevelGroups(levelIds);

  // 7) Subjects
  const subjectIds = await seedSubjects();

  // 8) Classes with usual SGT timings stored as UTC times
  const { classIds, classSpecs } = await seedClasses(
    levelGroupIds,
    subjectIds,
    classroomIds,
  );

  // 9) Weekly Lessons for each term and class
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
      classroomId: spec.classroomId,
      usualLessonPriceSgd: spec.usualLessonPriceSgd,
    };
  });
  await seedWeeklyLessons(terms, classesForLessons);

  // 10) Students and enrollments
  await seedStudents(classIds);

  // 11) Attendance records for every (student, lesson) pair based on enrollments
  await seedAttendance();

  // 12) Invoice (after classes, students, and attendances exist)
  await seedEducationInvoice(classIds);

  if (migrate) {
    await migrateFromJson();
  }

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
    educationAttendanceTable,
    educationStudentJoinClassTable,
    educationLessonTable,
    educationClassTable,
    educationClassroomTable,
    educationBranchTable,
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
