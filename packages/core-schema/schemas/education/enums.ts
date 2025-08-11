import { educationSchema } from './schema.ts';

export const educationDayOfTheWeek = educationSchema.enum('day_of_the_week', [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

export const educationResourceType = educationSchema.enum('resource_type', [
  'file',
  'url',
]);
