export type CourseFormData = {
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_published: boolean;
};

export const COURSE_CATEGORIES = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Health & Fitness",
  "Language",
  "Personal Development",
  "Other",
];

export type LectureFormData = {
  title: string;
  description: string;
  video_url: string;
  transcript: string;
  position: number;
};

export interface UploadProgress {
  status: "idle" | "uploading" | "transcribing" | "complete" | "error";
  progress: number;
  message?: string;
  error?: string;
}

export interface VideoData {
  file: File | null;
  url: string | null;
  transcript: string | null;
}
