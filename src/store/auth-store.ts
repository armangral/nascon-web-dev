import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: "student" | "tutor"
  ) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Fetch the user profile after sign in
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userError) throw userError;
      set({ user, isLoading: false });
    } catch (error) {
      console.error("Sign in error:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error; // Re-throw to handle in the component
    }
  },

  signUp: async (email, password, fullName, role) => {
    set({ isLoading: true, error: null });
    try {
      // Create the auth user
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        // Create the user profile
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            role,
          },
        ]);

        if (profileError) throw profileError;

        // Fetch the user profile
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError) throw userError;

        set({ user, isLoading: false });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error; // Re-throw to handle in the component
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error("Sign out error:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        set({ user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      set({ user: null, isLoading: false, error: (error as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
