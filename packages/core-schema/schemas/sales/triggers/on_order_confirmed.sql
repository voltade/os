drop trigger if exists on_order_confirmed on internal.sales_order;

create trigger on_order_confirmed
after
update on internal.sales_order for each row when (
  old.state <> 'Sale'
  and new.state = 'Sale'
)
execute function on_order_confirmed ();
