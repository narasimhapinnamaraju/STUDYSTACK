-- Add user_id column to link reports to specific users
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add reply column for admin responses
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS reply TEXT;

-- Update the status check constraint to allow 'Replied' status
-- First, drop the existing constraint if it exists (name might vary, so we try a common name or just add the new one)
-- If you created the table via Supabase UI, it might not have a named constraint, but let's assume standard SQL.
-- The safest way without knowing the constraint name is to just alter the column type or add a new constraint.

-- If you are using a check constraint for status:
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status IN ('Open', 'Resolved', 'Replied'));

-- Optional: Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- ==========================================
-- UPDATES FOR NEW CATEGORIES (PPTs & Textbooks)
-- ==========================================

-- SCENARIO A: If your `category` columns use a CHECK constraint
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_category_check;
ALTER TABLE subjects ADD CONSTRAINT subjects_category_check 
  CHECK (category IN ('Assignments', 'Notes', 'Lab Resources', 'Previous Year Question Papers', 'PPTs', 'Textbooks', 'Syllabus'));

ALTER TABLE files DROP CONSTRAINT IF EXISTS files_category_check;
ALTER TABLE files ADD CONSTRAINT files_category_check 
  CHECK (category IN ('Assignments', 'Notes', 'Lab Resources', 'Previous Year Question Papers', 'PPTs', 'Textbooks', 'Syllabus'));

-- SCENARIO B: If your `category` columns use a Postgres ENUM type (e.g., named 'category_type')
-- Uncomment and run these if you get an error about the check constraints above:
-- ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'PPTs';
-- ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'Textbooks';

-- ==========================================
-- UPDATES FOR COURSE, REGULATION, AND SEMESTER
-- ==========================================

ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS regulation TEXT,
ADD COLUMN IF NOT EXISTS semester TEXT,
ADD COLUMN IF NOT EXISTS syllabus TEXT;

-- Insert some default subjects so the new categories aren't empty in the UI
INSERT INTO subjects (name, category, course, regulation, semester) VALUES 
  ('Computer Networks', 'PPTs', 'B.Tech', 'R20', '3-1'),
  ('Database Management Systems', 'PPTs', 'B.Tech', 'R20', '2-2'),
  ('Operating Systems', 'Textbooks', 'B.Tech', 'R20', '2-2'),
  ('Software Engineering', 'Textbooks', 'B.Tech', 'R20', '3-1')
ON CONFLICT DO NOTHING;

-- ==========================================
-- UPDATES FOR FILE REVIEWS
-- ==========================================
CREATE TABLE IF NOT EXISTS file_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id TEXT, -- Changed from UUID to TEXT to allow 'guest'
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- If the table already exists and user_id is UUID, alter it:
DO $$
BEGIN
  BEGIN
    ALTER TABLE file_reviews ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  EXCEPTION
    WHEN undefined_column THEN
      -- Do nothing if column somehow doesn't exist
  END;
END $$;
