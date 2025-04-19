import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "../../store/auth-store";
import { useChatStore } from "../../store/chat-store";
import { formatDistance } from "date-fns";
import { getInitials } from "../../lib/utils";

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { messages, fetchMessages, sendMessage, subscribeToRoom } =
    useChatStore();

  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);

      // Subscribe to new messages
      const unsubscribe = subscribeToRoom(roomId, () => {
        // Scroll to bottom when new message arrives
        scrollToBottom();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    setIsLoading(true);

    try {
      const message = await sendMessage(newMessage, roomId, user.id);
      if (message) {
        setNewMessage("");
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isCurrentUser = user?.id === message.user_id;

          return (
            <div
              key={message.id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div className="flex max-w-[85%] md:max-w-xs lg:max-w-md">
                {!isCurrentUser && (
                  <div className="flex-shrink-0 mr-2">
                    {message.user?.avatar_url ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={message.user.avatar_url}
                        alt=""
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {message.user?.full_name
                          ? getInitials(message.user.full_name)
                          : "?"}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div
                    className={`p-3 rounded-lg break-words ${
                      isCurrentUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {message.user?.full_name && !isCurrentUser && (
                      <span className="font-medium mr-1">
                        {message.user.full_name}
                      </span>
                    )}
                    <span>
                      {formatDistance(
                        new Date(message.created_at),
                        new Date(),
                        {
                          addSuffix: true,
                        }
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t mt-auto">
        <form onSubmit={handleSubmit} className="transition-all duration-200">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-grow"
            />
            <Button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="transition-colors duration-200"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
