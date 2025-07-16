drop trigger if exists on_order_confirmed on sales.order;

create trigger on_order_confirmed
after
update on sales.order for each row when (
  old.state <> 'Sale'
  and new.state = 'Sale'
)
execute function sales.on_order_confirmed ();
