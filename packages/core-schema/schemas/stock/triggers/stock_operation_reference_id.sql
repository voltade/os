drop trigger if exists trg_set_stock_operation_reference_id on stock.operation;

create trigger trg_set_stock_operation_reference_id before insert on stock.operation for each row
execute function stock.set_stock_operation_reference_id ();
