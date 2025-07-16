drop trigger if exists trg_update_inventory_on_line_status_change on stock.operation_line;

-- Create the trigger to fire on both inserts and status updates
create trigger trg_update_inventory_on_line_status_change
after insert
or
update of status on stock.operation_line for each row
execute function stock.update_inventory_on_line_status_change ();
