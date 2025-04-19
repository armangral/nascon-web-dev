/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `course_id` (uuid, references courses)
      - `amount` (numeric)
      - `status` (enum: pending, completed, failed)
      - `payment_method` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `payments` table
    - Add policies for users to read their own payments
    - Add policies for tutors to read payments for their courses
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  course_id uuid REFERENCES courses(id) NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Tutors can read payments for their courses"
  ON payments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = payments.course_id
    AND courses.tutor_id = auth.uid()
  ));