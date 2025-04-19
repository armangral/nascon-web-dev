import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { ChatMessage, ChatRoom } from "../types";

interface ChatState {
  messages: ChatMessage[];
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  isLoading: boolean;
  error: string | null;

  fetchRooms: () => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (
    content: string,
    roomId: string,
    userId: string
  ) => Promise<ChatMessage | null>;
  subscribeToRoom: (roomId: string, callback: () => void) => () => void;
  createRoom: (
    name: string,
    courseId?: string,
    isPrivate?: boolean
  ) => Promise<void>;
  setCurrentRoom: (room: ChatRoom | null) => void;
  addMessage: (message: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      set({ rooms: data, isLoading: false });
    } catch (error) {
      console.error("Fetch rooms error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchMessages: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          `
          *,
          user:users(full_name, avatar_url)
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      set({ messages: data, isLoading: false });
    } catch (error) {
      console.error("Fetch messages error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  sendMessage: async (content, roomId, userId) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([
          {
            content,
            room_id: roomId,
            user_id: userId,
          },
        ])
        .select(
          `
          *,
          user:users(full_name, avatar_url)
        `
        )
        .single();

      if (error) throw error;

      // Add the message to the state immediately
      if (data) {
        get().addMessage(data as ChatMessage);
      }

      // Update the room's updated_at
      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", roomId);

      return data as ChatMessage;
    } catch (error) {
      console.error("Send message error:", error);
      set({ error: (error as Error).message });
      return null;
    }
  },

  subscribeToRoom: (roomId, callback) => {
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the new message with user data
          const { data } = await supabase
            .from("chat_messages")
            .select(
              `
              *,
              user:users(full_name, avatar_url)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            get().addMessage(data as ChatMessage);
            callback();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },

  createRoom: async (name, courseId, isPrivate = false) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .insert([
          {
            name,
            course_id: courseId,
            is_private: isPrivate,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        rooms: [data, ...state.rooms],
        currentRoom: data,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Create room error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setCurrentRoom: (room) => {
    set({ currentRoom: room });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
}));
