import { internalSchema } from '../../schema.ts';

// Using existing enums from public schema
export const repairOrderStatusEnum = internalSchema.enum(
  'repair_order_status_enum',
  ['new', 'confirmed', 'under_repair', 'repaired', 'cancelled'],
);

export const repairOrderPriorityEnum = internalSchema.enum(
  'repair_order_priority_level_enum',
  ['low', 'normal', 'high', 'urgent'],
);
