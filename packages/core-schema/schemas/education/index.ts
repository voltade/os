/**
 * This file is to support the typed [include relations](https://orm.drizzle.team/docs/rqb#include-relations) from drizzle query (the drizzle easy mode)
 */

export * from './enums.ts';
export * from './tables/class.ts';
export * from './tables/lesson.ts';
export * from './tables/level.ts';
export * from './tables/level_group.ts';
export * from './tables/level_group_join_level.ts';
export * from './tables/parent.ts';
export * from './tables/student.ts';
export * from './tables/student_join_class.ts';
export * from './tables/student_join_parent.ts';
export * from './tables/subject.ts';
export * from './views/class_view.ts';
export * from './views/student_view.ts';
