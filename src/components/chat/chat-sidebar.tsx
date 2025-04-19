import React from 'react';
import { useChatStore } from '../../store/chat-store';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { formatDistance } from 'date-fns';

interface ChatSidebarProps {
  onCreateRoom: () => void;
}

export function ChatSidebar({ onCreateRoom }: ChatSidebarProps) {
  const { rooms, currentRoom, setCurrentRoom } = useChatStore();

  return (
    <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Chat Rooms</h2>
        <p className="text-sm text-gray-600">
          Connect with tutors and students
        </p>
        <Button
          onClick={onCreateRoom}
          className="mt-2 w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Room
        </Button>
      </div>
      
      <div className="p-2">
        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No chat rooms yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Create one to start chatting
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => setCurrentRoom(room)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentRoom?.id === room.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate max-w-[120px]">
                      {room.name}
                    </span>
                    {room.is_private && (
                      <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistance(new Date(room.updated_at), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}