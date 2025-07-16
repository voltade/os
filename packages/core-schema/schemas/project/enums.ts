import { internalSchema } from '../../schema.ts';

const taskStatusEnum = internalSchema.enum('project_task_status_enum', [
  'pending',
  'in_progress',
  'completed',
  'changes_requested',
  'approved',
  'cancelled',
]);

export { taskStatusEnum };
