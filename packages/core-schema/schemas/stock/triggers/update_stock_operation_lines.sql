drop trigger if exists trg_update_stock_operation_lines on internal.stock_operation;

-- Create the trigger to fire on both inserts and status updates
create trigger trg_update_stock_operation_lines before insert
or
update of status on internal.stock_operation for each row
execute function internal.update_stock_operation_lines ();
