
-- Update sync_to_public_tips trigger to include non-private messages (amount = 0)
-- Previously only synced tips with amount > 0; now syncs all entries where is_private = false
CREATE OR REPLACE FUNCTION public.sync_to_public_tips()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Sync entries where is_private is false (or NULL, which defaults to public)
    IF COALESCE(NEW.is_private, false) = false THEN
      INSERT INTO public_tips (
        id, 
        qr_code_id,
        created_at, 
        message, 
        amount,
        reader_name,
        reader_avatar_url,
        is_private
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
      )
      ON CONFLICT (id) 
      DO UPDATE SET
        qr_code_id = EXCLUDED.qr_code_id,
        message = EXCLUDED.message,
        amount = EXCLUDED.amount,
        reader_name = EXCLUDED.reader_name,
        reader_avatar_url = EXCLUDED.reader_avatar_url,
        is_private = EXCLUDED.is_private;
    ELSE
      -- If is_private is true, delete from public_tips if it exists
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
$function$;
