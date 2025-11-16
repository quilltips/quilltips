-- Fix sync_to_public_tips to exclude messages (tips with amount = 0)
-- Messages should remain private and not appear in public tip feeds

CREATE OR REPLACE FUNCTION sync_to_public_tips()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Only sync tips with amount > 0 (exclude messages which have amount = 0)
    IF NEW.amount > 0 THEN
      INSERT INTO public_tips (
        id, 
        qr_code_id,
        created_at, 
        message, 
        amount,
        reader_name,
        reader_avatar_url,
        is_private
        -- NOTE: deliberately excluding reader_email for security
      )
      VALUES (
        NEW.id, 
        NEW.qr_code_id,
        NEW.created_at, 
        NEW.message, 
        NEW.amount,
        NEW.reader_name,
        NEW.reader_avatar_url,
        NEW.is_private
        -- NOTE: deliberately excluding reader_email for security
      )
      ON CONFLICT (id) 
      DO UPDATE SET
        qr_code_id = EXCLUDED.qr_code_id,
        message = EXCLUDED.message,
        amount = EXCLUDED.amount,
        reader_name = EXCLUDED.reader_name,
        reader_avatar_url = EXCLUDED.reader_avatar_url,
        is_private = EXCLUDED.is_private;
        -- NOTE: deliberately excluding reader_email for security
    ELSE
      -- If amount is 0 (message), delete from public_tips if it exists
      DELETE FROM public_tips WHERE id = NEW.id;
    END IF;

    RETURN NEW;

  -- For delete operations
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public_tips WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';