/*
  # Create courses table

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `tutor_id` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `category` (text)
      - `is_published` (boolean)
  2. Security
    - Enable RLS on `courses` table
    - Add policies for tutors to create/read/update their own courses
    - Add policies for all users to read published courses
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  tutor_id uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  category text NOT NULL,
  is_published boolean DEFAULT false
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can create their own courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tutor_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'tutor'
  ));

CREATE POLICY "Tutors can read their own courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = tutor_id);

CREATE POLICY "Everyone can read published courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Public can read published courses"
  ON courses
  FOR SELECT
  TO anon
  USING (is_published = true);