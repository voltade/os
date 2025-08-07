import { factory } from '#server/factory.ts';
import { route as registerStudentRoute } from './register-student.ts';

export const route = factory.createApp().route('/', registerStudentRoute);
