import { projectSchema } from './schema.ts';

export const taskStatusEnum = projectSchema.enum('project_task_status_enum', [
  'pending',
  'in_progress',
  'completed',
  'changes_requested',
  'approved',
  'cancelled',
]);
