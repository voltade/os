-- Create or replace function in internal schema
create or replace function internal.set_repair_reference () returns trigger as $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    current_month INTEGER := EXTRACT(MONTH FROM NOW());
    next_sequence INTEGER := 1;
BEGIN
    -- Only set reference_number if it's NULL
    IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN  
        -- Check if table exists before querying (for initial setup)
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'internal' 
                   AND table_name = 'repair_order') THEN
            SELECT COALESCE(MAX(CAST(SPLIT_PART(reference_number, '-', 4) AS INTEGER)), 0) + 1
            INTO next_sequence
            FROM internal.repair_order 
            WHERE reference_number LIKE 'REP-' || current_year || '-' || LPAD(current_month::TEXT, 2, '0') || '-%';
        END IF;
        
        NEW.reference_number := 'REP-' || current_year || '-' || LPAD(current_month::TEXT, 2, '0') || '-' || LPAD(next_sequence::TEXT, 4, '0');
    END IF;
    
    RETURN NEW;
END;
$$ language plpgsql;

-- Drop existing trigger if it exists
drop trigger if exists set_repair_reference_trigger on internal.repair_order;

-- Create trigger on the internal schema table
create trigger set_repair_reference_trigger before insert on internal.repair_order for each row
execute function internal.set_repair_reference ();
