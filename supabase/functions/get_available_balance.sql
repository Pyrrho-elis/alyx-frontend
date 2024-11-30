CREATE OR REPLACE FUNCTION get_available_balance(creator_id TEXT)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    available_amount DECIMAL;
BEGIN
    -- Calculate total available balance (not withdrawn or refunded)
    SELECT COALESCE(SUM(re.creator_share), 0)
    INTO available_amount
    FROM revenue_events re
    WHERE re.creator_id = creator_id
    AND re.status = 'available';

    RETURN available_amount;
END;
$$;
