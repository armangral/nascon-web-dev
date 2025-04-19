import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Course } from "../types";

interface CourseState {
  courses: Course[];
  featuredCourses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;

  fetchCourses: () => Promise<void>;
  fetchFeaturedCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  searchCourses: (query: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ courses: data, isLoading: false });
    } catch (error) {
      console.error("Fetch courses error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchFeaturedCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .limit(6)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ featuredCourses: data, isLoading: false });
    } catch (error) {
      console.error("Fetch featured courses error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchCourseById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      set({ currentCourse: data, isLoading: false });
    } catch (error) {
      console.error("Fetch course by id error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  searchCourses: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
        );

      if (error) throw error;
      set({ courses: data, isLoading: false });
    } catch (error) {
      console.error("Search courses error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
