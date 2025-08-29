-- Add image-related fields to stories table for persistence
-- Migration: Add image storage support to stories

-- Add image fields to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_storage_path TEXT,
ADD COLUMN IF NOT EXISTS image_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS image_model_used TEXT,
ADD COLUMN IF NOT EXISTS image_style TEXT,
ADD COLUMN IF NOT EXISTS image_generation_prompt TEXT;

-- Add comments for documentation
COMMENT ON COLUMN stories.image_url IS 'Public URL for the story illustration from Supabase Storage';
COMMENT ON COLUMN stories.image_storage_path IS 'Storage path in story-images bucket for management';
COMMENT ON COLUMN stories.image_generated_at IS 'Timestamp when the image was generated';
COMMENT ON COLUMN stories.image_model_used IS 'OpenRouter model used for image generation (e.g., google/gemini-2.5-flash-image-preview:free)';
COMMENT ON COLUMN stories.image_style IS 'Style used for image generation (educational, children, realistic, illustration)';
COMMENT ON COLUMN stories.image_generation_prompt IS 'Prompt used for image generation for debugging and optimization';

-- Create index for efficient queries by image status
CREATE INDEX IF NOT EXISTS idx_stories_has_image ON stories (id) WHERE image_url IS NOT NULL;

-- Create index for image generation analytics
CREATE INDEX IF NOT EXISTS idx_stories_image_model ON stories (image_model_used) WHERE image_model_used IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_image_generated_at ON stories (image_generated_at) WHERE image_generated_at IS NOT NULL;

-- Create storage bucket for story images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'story-images', 
  'story-images', 
  true, 
  5242880, -- 5MB limit per image
  ARRAY['image/png', 'image/jpeg', 'image/webp']
) 
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for story-images bucket

-- Policy: Users can view all story images (public read)
CREATE POLICY "Public read access for story images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'story-images');

-- Policy: Authenticated users can upload story images
CREATE POLICY "Authenticated users can upload story images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'story-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'stories'
);

-- Policy: Users can update their own story images
CREATE POLICY "Users can update story images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'story-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can delete story images (for cleanup)
CREATE POLICY "Users can delete story images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'story-images' 
  AND auth.role() = 'authenticated'
);

-- Create function to cleanup orphaned images (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_orphaned_story_images()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete storage objects that don't have corresponding story records
  DELETE FROM storage.objects 
  WHERE bucket_id = 'story-images'
  AND NOT EXISTS (
    SELECT 1 FROM stories 
    WHERE stories.image_storage_path = storage.objects.name
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add cleanup function permissions
GRANT EXECUTE ON FUNCTION cleanup_orphaned_story_images() TO authenticated;

-- Create trigger to update story metadata when image is added
CREATE OR REPLACE FUNCTION update_story_image_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update updated_at when image fields change
  IF (OLD.image_url IS DISTINCT FROM NEW.image_url) 
     OR (OLD.image_storage_path IS DISTINCT FROM NEW.image_storage_path) THEN
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to stories table
DROP TRIGGER IF EXISTS trigger_update_story_image_metadata ON stories;
CREATE TRIGGER trigger_update_story_image_metadata
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_story_image_metadata();