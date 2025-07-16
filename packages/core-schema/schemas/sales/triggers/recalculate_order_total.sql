create or replace function sales.recalculate_order_total () returns trigger as $$
BEGIN
  -- Prevent changing the order_id of an order line item
  IF TG_OP = 'UPDATE' AND NEW.order_id IS DISTINCT FROM OLD.order_id THEN
    RAISE EXCEPTION 'Order items are not allowed to be moved between orders.';
  END IF;

  UPDATE sales.order
  SET 
    amount_untaxed = (
      SELECT COALESCE(SUM(price_subtotal), 0) 
      FROM sales.order_line 
      WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    ),
    amount_tax = (
      SELECT COALESCE(SUM(price_tax), 0) 
      FROM sales.order_line 
      WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    ),
    amount_total = (
      SELECT COALESCE(SUM(price_total), 0) 
      FROM sales.order_line 
      WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);

  RETURN NEW;
END;
$$ language plpgsql;

drop trigger if exists recalculate_order_total_trigger on sales.order_line;

create trigger recalculate_order_total_trigger
after insert
or
update
or delete on sales.order_line for each row
execute function sales.recalculate_order_total ();
