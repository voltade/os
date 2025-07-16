drop trigger if exists trg_update_inventory_on_line_item_status_change on internal.stock_operation_line_item;

-- Create the trigger to fire on both inserts and status updates
create trigger trg_update_inventory_on_line_item_status_change
after insert
or
update of status on internal.stock_operation_line_item for each row
execute function internal.update_inventory_on_line_item_status_change ();
