import { stockSchema } from '../schema.ts';
import { enumToPgEnum } from '../utils.ts';

/**
 * The type of stock operation.
 *
 * - Import: Products coming in (procurement).
 * - Manufacture: Component parts going out, assembled products coming in.
 * - Repair: Products temporarily coming in (on trigger).
 * - Return: Products returned from customers.
 * - Transfer: Movement of products between locations.
 * - Export: Products going out.
 * - Sale: Products sold.
 */
export enum StockOperationType {
  IN = 'Import',
  MO = 'Manufacture',
  RO = 'Repair',
  RTN = 'Return',
  TRF = 'Transfer',
  OUT = 'Export',
  POS = 'Sale',
}

/**
 * The type of stock operation as a `pgEnum`.
 *
 * - Import: Products coming in (procurement).
 * - Manufacture: Component parts going out, assembled products coming in.
 * - Repair: Products temporarily coming in (on trigger).
 * - Return: Products returned from customers.
 * - Transfer: Movement of products between locations.
 * - Export: Products going out.
 * - Sale: Products sold.
 */
export const stockOperationTypeEnum = stockSchema.enum(
  'stock_operation_type_enum',
  enumToPgEnum(StockOperationType),
);

/**
 * The status of a stock operation.
 *
 * - Draft: Initial state, not yet confirmed.
 * - Created: Operation has been created, but not yet started.
 * - Assigned: Resources have been assigned to the operation.
 * - Reserved: Resources are reserved for the operation.
 * - Pending: Operation is waiting for some condition to be met.
 * - Approved: Operation has been approved and is ready to proceed.
 * - Processing: Operation is currently being processed.
 * - Delayed: Operation is delayed for some reason.
 * - Blocked: Operation is blocked and cannot proceed.
 * - Cancelled: Operation has been cancelled.
 * - Completed: Operation has been completed successfully.
 * - Done: Final state, all operations are done.
 */
export enum StockOperationStatus {
  DRAFT = 'Draft',
  CREATED = 'Created',
  ASSIGNED = 'Assigned',
  RESERVED = 'Reserved',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  PROCESSING = 'Processing',
  DELAYED = 'Delayed',
  BLOCKED = 'Blocked',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  DONE = 'Done',
}

/**
 * The status of a stock operation, as a `pgEnum`.
 *
 * - Draft: Initial state, not yet confirmed.
 * - Created: Operation has been created, but not yet started.
 * - Assigned: Resources have been assigned to the operation.
 * - Reserved: Resources are reserved for the operation.
 * - Pending: Operation is waiting for some condition to be met.
 * - Approved: Operation has been approved and is ready to proceed.
 * - Processing: Operation is currently being processed.
 * - Delayed: Operation is delayed for some reason.
 * - Blocked: Operation is blocked and cannot proceed.
 * - Cancelled: Operation has been cancelled.
 * - Completed: Operation has been completed successfully.
 * - Done: Final state, all operations are done.
 */
export const stockOperationStatusEnum = stockSchema.enum(
  'operation_status_enum',
  enumToPgEnum(StockOperationStatus),
);

/**
 * The status of a stock operation line.
 *
 * - Pending: Line is pending processing.
 * - In Progress: Line is currently being processed.
 * - Completed: Line has been completed.
 * - Cancelled: Line has been cancelled.
 */
export enum StockOperationLineStatus {
  PENDING = 'Pending',
  RESERVED = 'Reserved',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

/**
 * The status of a stock operation line, as a `pgEnum`.
 *
 * - Pending: Line is pending processing.
 * - In Progress: Line is currently being processed.
 * - Completed: Line has been completed.
 * - Cancelled: Line has been cancelled.
 */
export const stockOperationLineStatusEnum = stockSchema.enum(
  'operation_line_status_enum',
  enumToPgEnum(StockOperationLineStatus),
);
