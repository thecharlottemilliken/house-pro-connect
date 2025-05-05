
-- Add design_assets column to room_design_preferences if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'room_design_preferences' 
        AND column_name = 'design_assets'
    ) THEN
        ALTER TABLE public.room_design_preferences 
        ADD COLUMN design_assets JSONB DEFAULT '[]'::jsonb;
    END IF;
END
$$;
