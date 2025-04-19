/*
  # Add read policy for enrolled students to lectures table
  
  This migration adds a policy that enables enrolled students to read lecture content
  for courses they are enrolled in. This migration must be applied after both
  the lectures and enrollments tables have been created.
  
  1. Security Updates
    - Add policy for enrolled students to read lectures in courses they're enrolled in
*/

CREATE POLICY "Enrolled students can read lectures"
  ON lectures
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = lectures.course_id
    AND enrollments.user_id = auth.uid()
  ));