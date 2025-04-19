import React from "react";
import { formatDistance } from "date-fns";
import { getInitials } from "../../lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import type { ChatMessage } from "../../types";
import { User } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUser: User | null;
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const isCurrentUser = currentUser?.id === message.user_id;
  const isOptimistic = message.id.startsWith("temp-");
  const hasFailed = "error" in message && message.error === true;

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-xs lg:max-w-md">
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

        <div>
          <div
            className={`p-3 rounded-lg ${
              isCurrentUser
                ? `${
                    hasFailed
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-600 text-white"
                  } rounded-br-none`
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            } ${isOptimistic ? "opacity-70" : ""}`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            {message.user?.full_name && !isCurrentUser && (
              <span className="font-medium mr-1">{message.user.full_name}</span>
            )}
            <span>
              {formatDistance(new Date(message.created_at), new Date(), {
                addSuffix: true,
              })}
            </span>

            {isOptimistic && (
              <span className="ml-1 inline-flex items-center">
                <Loader2 className="h-3 w-3 animate-spin ml-1" />
              </span>
            )}

            {hasFailed && (
              <span className="ml-1 text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Failed to send
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
