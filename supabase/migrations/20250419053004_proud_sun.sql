/*
  # Create lectures table

  1. New Tables
    - `lectures`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `transcript` (text)
      - `course_id` (uuid, references courses)
      - `position` (integer)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `lectures` table
    - Add policies for tutors to manage lectures in their courses
*/

CREATE TABLE IF NOT EXISTS lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text,
  transcript text,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage lectures for their courses"
  ON lectures
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = lectures.course_id
    AND courses.tutor_id = auth.uid()
  ));