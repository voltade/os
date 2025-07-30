import { enumToPgEnum } from '../utils.ts';
import { repairSchema } from './schema.ts';

/**
 * Enum for repair order statuses.
 *
 * - NEW: The repair order has been created but not yet confirmed.
 * - CONFIRMED: The repair order has been confirmed and is awaiting action.
 * - UNDER_REPAIR: The repair is currently in progress.
 * - REPAIRED: The repair has been completed.
 * - CANCELLED: The repair order has been cancelled.
 */
export enum RepairOrderStatus {
  NEW = 'new',
  CONFIRMED = 'confirmed',
  UNDER_REPAIR = 'under_repair',
  REPAIRED = 'repaired',
  CANCELLED = 'cancelled',
}

/**
 * Enum for repair order statuses as a `pgEnum`.
 *
 * - NEW: The repair order has been created but not yet confirmed.
 * - CONFIRMED: The repair order has been confirmed and is awaiting action.
 * - UNDER_REPAIR: The repair is currently in progress.
 * - REPAIRED: The repair has been completed.
 * - CANCELLED: The repair order has been cancelled.
 */
export const repairOrderStatusEnum = repairSchema.enum(
  'order_status_enum',
  enumToPgEnum(RepairOrderStatus),
);

/**
 * Enum for repair order priority levels.
 *
 * - LOW: Low priority, can be addressed later.
 * - NORMAL: Normal priority, standard processing time.
 * - HIGH: High priority, needs prompt attention.
 * - URGENT: Urgent priority, requires immediate action.
 */
export enum RepairOrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Enum for repair order priority levels as a `pgEnum`.
 *
 * - LOW: Low priority, can be addressed later.
 * - NORMAL: Normal priority, standard processing time.
 * - HIGH: High priority, needs prompt attention.
 * - URGENT: Urgent priority, requires immediate action.
 */
export const repairOrderPriorityEnum = repairSchema.enum(
  'order_priority_level_enum',
  enumToPgEnum(RepairOrderPriority),
);
