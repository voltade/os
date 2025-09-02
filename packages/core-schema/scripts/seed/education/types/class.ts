export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type Time =
  | `${number}:${number} ${'am' | 'pm'}`
  | `${number} ${'am' | 'pm'}`;

export type Subject = string;
export type Branch = string;
export type LevelGroup = string;
export type Tutor = string;
export type Classroom = string;

export interface Class {
  levelGroup: LevelGroup;
  subject: Subject;
  startTime: Time;
  endTime: Time;
  branch: Branch;
  day: Day;
  tutor: Tutor;
  noOfDays: number;
  capacity: number;
  classroom: Classroom;
}
