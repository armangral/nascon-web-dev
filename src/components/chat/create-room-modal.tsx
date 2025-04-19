import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useChatStore } from '../../store/chat-store';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
}

export function CreateRoomModal({ isOpen, onClose, courseId }: CreateRoomModalProps) {
  const { createRoom } = useChatStore();
  
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await createRoom(roomName, courseId, isPrivate);
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Create New Chat Room</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <Input
            label="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            required
          />
          
          <div className="flex items-center">
            <input
              id="is-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is-private" className="ml-2 block text-sm text-gray-700">
              Make this room private
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Create Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}