import { salesSchema } from './schema.ts';

export const orderState = salesSchema.enum('order_state', [
  'Draft',
  'Sent',
  'Sale',
]);

export const orderLineType = salesSchema.enum('order_line_type', [
  'Product',
  'Section',
  'Note',
]);
