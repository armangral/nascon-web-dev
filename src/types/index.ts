export type Role = "student" | "tutor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: Role;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tutor_id: string;
  created_at: string;
  updated_at: string;
  category: string;
  is_published: boolean;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  transcript?: string;
  course_id: string;
  position: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  payment_id?: string;
  status: "active" | "completed" | "cancelled";
}

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  room_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  error?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  course_id?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  payment_method: string;
  created_at: string;
}
