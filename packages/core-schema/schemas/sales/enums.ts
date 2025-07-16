import { internalSchema } from '../../schema.ts';

export const orderState = internalSchema.enum('sales_order_state', [
  'Draft',
  'Sent',
  'Sale',
]);

export const orderLineType = internalSchema.enum('sales_order_line_type', [
  'Product',
  'Section',
  'Note',
]);
