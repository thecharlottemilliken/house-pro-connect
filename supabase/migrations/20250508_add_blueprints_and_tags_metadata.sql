
-- Add a blueprints column to room_design_preferences table
ALTER TABLE room_design_preferences 
ADD COLUMN blueprints TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add a tags_metadata column to store tags for different file types
ALTER TABLE room_design_preferences 
ADD COLUMN tags_metadata JSONB DEFAULT '{}'::JSONB;
