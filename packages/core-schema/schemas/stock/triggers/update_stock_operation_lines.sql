drop trigger if exists trg_update_stock_operation_lines on stock.operation;

-- Create the trigger to fire on both inserts and status updates
create trigger trg_update_stock_operation_lines before insert
or
update of status on stock.operation for each row
execute function stock.update_stock_operation_lines ();
