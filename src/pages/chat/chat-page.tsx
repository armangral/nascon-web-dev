import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/main-layout';
import { ChatSidebar } from '../../components/chat/chat-sidebar';
import { ChatRoom } from '../../components/chat/chat-room';
import { CreateRoomModal } from '../../components/chat/create-room-modal';
import { useChatStore } from '../../store/chat-store';
import { useAuthStore } from '../../store/auth-store';
import { useNavigate } from 'react-router-dom';

export function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchRooms, rooms, currentRoom, setCurrentRoom } = useChatStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    fetchRooms();
  }, [user]);
  
  useEffect(() => {
    if (rooms.length > 0 && !currentRoom) {
      setCurrentRoom(rooms[0]);
    }
  }, [rooms]);
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-[calc(100vh-16rem)] flex">
            <div className="hidden md:block">
              <ChatSidebar
                onCreateRoom={() => setIsCreateModalOpen(true)}
              />
            </div>
            
            <div className="flex-grow">
              {currentRoom ? (
                <ChatRoom roomId={currentRoom.id} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <h3 className="text-lg font-medium text-gray-900">No chat room selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a chat room from the sidebar or create a new one
                    </p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create New Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </MainLayout>
  );
}