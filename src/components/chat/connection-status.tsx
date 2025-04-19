import React from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useChatStore } from "../../store/chat-store";

interface ConnectionStatusProps {
  roomId: string;
}

export function ConnectionStatus({ roomId }: ConnectionStatusProps) {
  const { connectionStatus, reconnect } = useChatStore();

  const handleReconnect = () => {
    reconnect(roomId, () => {});
  };

  if (connectionStatus === "connected") {
    return (
      <div className="flex items-center text-xs text-green-600">
        <Wifi className="h-3 w-3 mr-1" />
        <span>Connected</span>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="flex items-center text-xs text-amber-600">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-xs text-red-600">
      <WifiOff className="h-3 w-3 mr-1" />
      <span className="mr-2">Disconnected</span>
      <button
        onClick={handleReconnect}
        className="text-xs underline text-blue-600"
      >
        Reconnect
      </button>
    </div>
  );
}
