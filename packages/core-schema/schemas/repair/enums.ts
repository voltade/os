import { repairSchema } from './schema.ts';

// Using existing enums from public schema
export const repairOrderStatusEnum = repairSchema.enum('order_status_enum', [
  'new',
  'confirmed',
  'under_repair',
  'repaired',
  'cancelled',
]);

export const repairOrderPriorityEnum = repairSchema.enum(
  'order_priority_level_enum',
  ['low', 'normal', 'high', 'urgent'],
);
