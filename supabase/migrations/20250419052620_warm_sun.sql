/*
  # Create chat rooms and messages tables

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `course_id` (uuid, references courses, nullable)
      - `is_private` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `chat_messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references users)
      - `room_id` (uuid, references chat_rooms)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and create messages
*/

CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_rooms
CREATE POLICY "Everyone can read non-private chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (is_private = false);

CREATE POLICY "Course students can read course chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = chat_rooms.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can read chat rooms for their courses"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = chat_rooms.course_id
      AND courses.tutor_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create chat rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for chat_messages
CREATE POLICY "Users can read messages in accessible rooms"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (
        chat_rooms.is_private = false
        OR (
          chat_rooms.course_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.course_id = chat_rooms.course_id
            AND enrollments.user_id = auth.uid()
          )
        )
        OR (
          chat_rooms.course_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = chat_rooms.course_id
            AND courses.tutor_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can create messages in accessible rooms"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (
        chat_rooms.is_private = false
        OR (
          chat_rooms.course_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.course_id = chat_rooms.course_id
            AND enrollments.user_id = auth.uid()
          )
        )
        OR (
          chat_rooms.course_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = chat_rooms.course_id
            AND courses.tutor_id = auth.uid()
          )
        )
      )
    )
  );