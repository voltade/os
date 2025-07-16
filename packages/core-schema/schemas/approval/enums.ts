import { approvalSchema } from './schema.ts';

export const approvalCategoryType = approvalSchema.enum('category_type', [
  'purchase',
]);

export const approvalRequestStatusType = approvalSchema.enum('request_status', [
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);
