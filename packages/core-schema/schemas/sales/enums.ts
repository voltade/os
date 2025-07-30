import { enumToPgEnum } from '../utils.ts';
import { salesSchema } from './schema.ts';

/**
 * Enum for sales order states.
 *
 * - DRAFT: Initial state of the order.
 * - SENT: Order has been sent to the customer.
 * - SALE: Order is confirmed and in the sales process.
 */
export enum OrderState {
  DRAFT = 'Draft',
  SENT = 'Sent',
  SALE = 'Sale',
}

/**
 * Enum for sales order states as a `pgEnum`.
 *
 * - DRAFT: Initial state of the order.
 * - SENT: Order has been sent to the customer.
 * - SALE: Order is confirmed and in the sales process.
 */
export const orderState = salesSchema.enum(
  'order_state',
  enumToPgEnum(OrderState),
);

/**
 * Enum for order line types.
 *
 * - PRODUCT: Represents a product in the order.
 * - SECTION: Represents a section in the order.
 * - NOTE: Represents a note in the order.
 */
export enum OrderLineType {
  PRODUCT = 'Product',
  SECTION = 'Section',
  NOTE = 'Note',
}

/**
 * Enum for order line types as a `pgEnum`.
 *
 * - PRODUCT: Represents a product in the order.
 * - SECTION: Represents a section in the order.
 * - NOTE: Represents a note in the order.
 */
export const orderLineType = salesSchema.enum(
  'order_line_type',
  enumToPgEnum(OrderLineType),
);
