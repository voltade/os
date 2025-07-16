-- Create or replace function in internal schema
create or replace function purchase.handle_purchase_order_creation () returns trigger as $$
BEGIN
   -- 1. Update the purchase requisition status to 'completed'
   UPDATE purchase.requisition 
   SET 
       status = 'completed',
       updated_at = NOW(),
       updated_by = NEW.created_by
   WHERE id = NEW.purchase_requisition_id;
   
   -- 2. Automatically create purchase order line items
   INSERT INTO purchase.order_item (
       purchase_order_id,
       created_by,
       updated_by,
       quotation_item_id,
       quantity,
       unit_price,
       unit_price_with_tax,
       created_at,
       updated_at
   )
   SELECT 
       NEW.id AS purchase_order_id,
       NEW.created_by,
       NEW.updated_by,
       pqi.id AS quotation_item_id,
       pri.quantity,
       pqi.unit_price,
       pqi.unit_price_with_tax,
       NOW() AS created_at,
       NOW() AS updated_at
   FROM purchase.requisition_item pri
   INNER JOIN purchase.requisition_quotation prq 
       ON prq.purchase_requisition_id = pri.purchase_requisition_id
   INNER JOIN purchase.quotation_item pqi 
       ON pqi.quotation_id = prq.quotation_id
   WHERE pri.purchase_requisition_id = NEW.purchase_requisition_id
     AND pqi.quotation_id = NEW.quotation_id;
   
   -- Check if any items were created
   IF NOT FOUND THEN
       RAISE EXCEPTION 'No matching items found for purchase requisition % and quotation %', 
           NEW.purchase_requisition_id, NEW.quotation_id;
   END IF;
   
   RETURN NEW;
END;
$$ language plpgsql;

-- Create or replace the trigger on the internal schema table
create or replace trigger trigger_handle_purchase_order_creation
after insert on purchase.order for each row
execute function purchase.handle_purchase_order_creation ();
