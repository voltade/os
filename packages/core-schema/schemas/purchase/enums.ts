import { purchaseSchema } from './schema.ts';

export const purchaseRequisitionStatus = purchaseSchema.enum(
  'requisition_status',
  ['draft', 'pending', 'approved', 'rejected', 'RFQ sent', 'completed'],
);

export const purchaseQuotationType = purchaseSchema.enum('quotation_type', [
  'standard',
  'bulk',
  'custom',
  'urgent',
]);

export const purchaseRequisitionPriority = purchaseSchema.enum(
  'requisition_priority',
  ['low', 'medium', 'high', 'urgent'],
);

export const purchaseOrderStatus = purchaseSchema.enum(
  'purchase_order_status',
  [
    'draft',
    'pending',
    'approved',
    'rejected',
    'awaiting_delivery',
    'completed',
    'cancelled',
  ],
);
