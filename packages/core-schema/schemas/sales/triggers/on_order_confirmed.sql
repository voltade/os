drop trigger if exists on_order_confirmed on stock.sales_order;

create trigger on_order_confirmed
after
update on stock.sales_order for each row when (
  old.state <> 'Sale'
  and new.state = 'Sale'
)
execute function stock.on_order_confirmed ();
