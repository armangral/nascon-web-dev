/*
  # Create enrollments table

  1. New Tables
    - `enrollments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `course_id` (uuid, references courses)
      - `created_at` (timestamp)
      - `payment_id` (uuid)
      - `status` (enum: active, completed, cancelled)
  2. Security
    - Enable RLS on `enrollments` table
    - Add policies for students to read their own enrollments
    - Add policies for tutors to read enrollments for their courses
*/

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  course_id uuid REFERENCES courses(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  payment_id uuid,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  UNIQUE (user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Tutors can read enrollments for their courses"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.tutor_id = auth.uid()
  ));

CREATE POLICY "Students can create their own enrollments"
  ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own enrollments"
  ON enrollments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);