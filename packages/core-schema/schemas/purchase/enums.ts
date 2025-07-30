import { enumToPgEnum } from '../utils.ts';
import { purchaseSchema } from './schema.ts';

/**
 * Enum for purchase requisition statuses.
 *
 * - DRAFT: The requisition is in draft state.
 * - PENDING: The requisition is awaiting approval.
 * - APPROVED: The requisition has been approved.
 * - REJECTED: The requisition has been rejected.
 * - RFQ_SENT: A Request for Quotation has been sent.
 * - COMPLETED: The requisition process is completed.
 */
export enum PurchaseRequisitionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RFQ_SENT = 'RFQ sent',
  COMPLETED = 'completed',
}

/**
 * Enum for purchase requisition statuses as a `pgEnum`.
 *
 * - DRAFT: The requisition is in draft state.
 * - PENDING: The requisition is awaiting approval.
 * - APPROVED: The requisition has been approved.
 * - REJECTED: The requisition has been rejected.
 * - RFQ_SENT: A Request for Quotation has been sent.
 * - COMPLETED: The requisition process is completed.
 */
export const purchaseRequisitionStatus = purchaseSchema.enum(
  'requisition_status',
  enumToPgEnum(PurchaseRequisitionStatus),
);

/**
 * Enum for purchase quotation types.
 *
 * - STANDARD: A standard quotation.
 * - BULK: A quotation for bulk purchases.
 * - CUSTOM: A custom quotation.
 * - URGENT: A quotation for urgent requests.
 */
export enum PurchaseQuotationType {
  STANDARD = 'standard',
  BULK = 'bulk',
  CUSTOM = 'custom',
  URGENT = 'urgent',
}

/**
 * Enum for purchase quotation types as a `pgEnum`.
 *
 * - STANDARD: A standard quotation.
 * - BULK: A quotation for bulk purchases.
 * - CUSTOM: A custom quotation.
 * - URGENT: A quotation for urgent requests.
 */
export const purchaseQuotationType = purchaseSchema.enum(
  'quotation_type',
  enumToPgEnum(PurchaseQuotationType),
);

/**
 * Enum for purchase requisition priorities.
 *
 * - LOW: Low priority requisition.
 * - MEDIUM: Medium priority requisition.
 * - HIGH: High priority requisition.
 * - URGENT: Urgent requisition that requires immediate attention.
 */
export enum PurchaseRequisitionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Enum for purchase requisition priorities as a `pgEnum`.
 *
 * - LOW: Low priority requisition.
 * - MEDIUM: Medium priority requisition.
 * - HIGH: High priority requisition.
 * - URGENT: Urgent requisition that requires immediate attention.
 */
export const purchaseRequisitionPriority = purchaseSchema.enum(
  'requisition_priority',
  enumToPgEnum(PurchaseRequisitionPriority),
);

/**
 * Enum for purchase order statuses.
 *
 * - DRAFT: The order is in draft state.
 * - PENDING: The order is awaiting approval.
 * - APPROVED: The order has been approved.
 * - REJECTED: The order has been rejected.
 * - AWAITING_DELIVERY: The order is awaiting delivery.
 * - COMPLETED: The order process is completed.
 * - Cancelled: The order has been cancelled.
 */
export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  AWAITING_DELIVERY = 'awaiting_delivery',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Enum for purchase order statuses as a `pgEnum`.
 *
 * - DRAFT: The order is in draft state.
 * - PENDING: The order is awaiting approval.
 * - APPROVED: The order has been approved.
 * - REJECTED: The order has been rejected.
 * - AWAITING_DELIVERY: The order is awaiting delivery.
 * - COMPLETED: The order process is completed.
 * - CANCELLED: The order has been cancelled.
 */
export const purchaseOrderStatus = purchaseSchema.enum(
  'purchase_order_status',
  enumToPgEnum(PurchaseOrderStatus),
);
