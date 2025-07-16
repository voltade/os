alter table purchase.requisition
alter column reference_id
set default get_next_sequence_number ('purchase_requisition');

alter table purchase.order
alter column reference_id
set default get_next_sequence_number ('purchase_order');

alter table purchase.quotation
alter column reference_id
set default get_next_sequence_number ('purchase_quotation');
