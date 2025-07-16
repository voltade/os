create or replace function get_next_sequence_number (sequence_type text) returns text as $$
DECLARE
    seq_record RECORD;
    current_year INTEGER;
    next_number INTEGER;
    formatted_number TEXT;
    reference_id TEXT;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW());
    
    -- Lock the row to prevent concurrent access
    SELECT * INTO seq_record 
    FROM internal.resource_sequence 
    WHERE type = sequence_type
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sequence type % not found', sequence_type;
    END IF;
    
    -- Check if year has changed, reset counter if so
    IF seq_record.current_year != current_year THEN
        -- Reset for new year
        UPDATE internal.resource_sequence 
        SET current_year = current_year, 
            number_next = seq_record.number_increment
        WHERE type = sequence_type;
        
        next_number := 1;
    ELSE
        -- Use current number and increment
        next_number := seq_record.number_next;
        
        UPDATE internal.resource_sequence 
        SET number_next = number_next + seq_record.number_increment
        WHERE type = sequence_type;
    END IF;
    
    -- Format the number with padding
    formatted_number := LPAD(next_number::TEXT, seq_record.padding, '0');
    
    -- Create reference ID: PREFIX-YEAR-NUMBER
    reference_id := seq_record.prefix || '-' || current_year || '-' || formatted_number;
    
    RETURN reference_id;
END;
$$ language plpgsql;
