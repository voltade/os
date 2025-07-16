drop trigger if exists trg_set_stock_operation_reference_id on internal.stock_operation;

create trigger trg_set_stock_operation_reference_id before insert on internal.stock_operation for each row
execute function internal.set_stock_operation_reference_id ();
