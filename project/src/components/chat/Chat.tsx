import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Search, Plus, Users, Settings, X, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  user_id: string;
  room_id: string;
  created_at: string;
  user: {
    email: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  created_at: string;
  members: number;
  created_by: string;
}

interface ChatRoomMember {
  user_id: string;
  role: 'admin' | 'member';
  user: {
    email: string;
    name: string | null;
  };
}

// Mock data for chat rooms
const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General',
    description: 'General discussion for the team',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    members: 8,
    created_by: 'user-1'
  },
  {
    id: '2',
    name: 'Development',
    description: 'Technical discussions about development',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    members: 5,
    created_by: 'user-2'
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Discussions about marketing strategies',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    members: 4,
    created_by: 'user-3'
  },
  {
    id: '4',
    name: 'Design',
    description: 'Design discussions and feedback',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    members: 3,
    created_by: 'user-1'
  }
];

// Mock data for room members
const mockRoomMembers: Record<string, ChatRoomMember[]> = {
  '1': [
    { user_id: 'user-1', role: 'admin', user: { email: 'john.doe@example.com', name: 'John Doe' } },
    { user_id: 'user-2', role: 'member', user: { email: 'jane.smith@example.com', name: 'Jane Smith' } },
    { user_id: 'user-3', role: 'member', user: { email: 'robert.johnson@example.com', name: 'Robert Johnson' } }
  ],
  '2': [
    { user_id: 'user-2', role: 'admin', user: { email: 'jane.smith@example.com', name: 'Jane Smith' } },
    { user_id: 'user-1', role: 'member', user: { email: 'john.doe@example.com', name: 'John Doe' } }
  ],
  '3': [
    { user_id: 'user-3', role: 'admin', user: { email: 'robert.johnson@example.com', name: 'Robert Johnson' } },
    { user_id: 'user-1', role: 'member', user: { email: 'john.doe@example.com', name: 'John Doe' } }
  ],
  '4': [
    { user_id: 'user-1', role: 'admin', user: { email: 'john.doe@example.com', name: 'John Doe' } }
  ]
};

// Mock messages for each room
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      content: 'Welcome to the General chat room!',
      user_id: 'user-1',
      room_id: '1',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user: { email: 'john.doe@example.com' }
    },
    {
      id: '1-2',
      content: 'Hey everyone! How is the project going?',
      user_id: 'user-2',
      room_id: '1',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      user: { email: 'jane.smith@example.com' }
    },
    {
      id: '1-3',
      content: 'We\'re making good progress on the new features.',
      user_id: 'user-3',
      room_id: '1',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: { email: 'robert.johnson@example.com' }
    }
  ],
  '2': [
    {
      id: '2-1',
      content: 'Has anyone reviewed the latest pull request?',
      user_id: 'user-2',
      room_id: '2',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: { email: 'jane.smith@example.com' }
    },
    {
      id: '2-2',
      content: 'I\'ll take a look at it this afternoon.',
      user_id: 'user-1',
      room_id: '2',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: { email: 'john.doe@example.com' }
    }
  ],
  '3': [
    {
      id: '3-1',
      content: 'We need to start planning the Q4 marketing campaign.',
      user_id: 'user-3',
      room_id: '3',
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      user: { email: 'robert.johnson@example.com' }
    }
  ],
  '4': [
    {
      id: '4-1',
      content: 'Has anyone seen the latest design mockups?',
      user_id: 'user-1',
      room_id: '4',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      user: { email: 'john.doe@example.com' }
    }
  ]
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [editRoom, setEditRoom] = useState({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [roomMembers, setRoomMembers] = useState<ChatRoomMember[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('user-1'); // Hardcoded for mock
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set current user ID for mock data
    setCurrentUserId('user-1');
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom.id);
      fetchRoomMembers(currentRoom.id);
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchRooms() {
    try {
      // Simulate API fetch delay
      setTimeout(() => {
        setRooms(mockChatRooms);
        if (mockChatRooms.length > 0) {
          setCurrentRoom(mockChatRooms[0]);
        }
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError('Failed to fetch chat rooms');
      setLoading(false);
    }
  }

  async function fetchRoomMembers(roomId: string) {
    try {
      // Simulate API fetch
      setRoomMembers(mockRoomMembers[roomId] || []);
    } catch (err) {
      console.error('Error fetching room members:', err);
      setError('Failed to fetch room members');
    }
  }

  async function fetchMessages(roomId: string) {
    try {
      // Simulate API fetch
      setMessages(mockMessages[roomId] || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoom.name.trim()) return;

    try {
      // Create a new mock room
      const newRoomId = `${rooms.length + 1}`;
      const newRoomData: ChatRoom = {
        id: newRoomId,
        name: newRoom.name.trim(),
        description: newRoom.description.trim(),
        created_at: new Date().toISOString(),
        members: 1,
        created_by: currentUserId
      };
      
      // Create mock room members
      mockRoomMembers[newRoomId] = [
        { 
          user_id: currentUserId, 
          role: 'admin', 
          user: { 
            email: 'john.doe@example.com', 
            name: 'John Doe' 
          } 
        }
      ];
      
      // Create empty messages array
      mockMessages[newRoomId] = [];
      
      // Update state
      setRooms([newRoomData, ...rooms]);
      setShowNewRoomDialog(false);
      setNewRoom({ name: '', description: '' });
      setCurrentRoom(newRoomData);
    } catch (err) {
      console.error('Error creating chat room:', err);
      setError('Failed to create chat room');
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom) return;
    
    try {
      // Create a new mock message
      const newMessageData: Message = {
        id: `${currentRoom.id}-${Date.now()}`,
        content: newMessage.trim(),
        user_id: currentUserId,
        room_id: currentRoom.id,
        created_at: new Date().toISOString(),
        user: { email: 'john.doe@example.com' }
      };
      
      // Add to messages
      const updatedMessages = [...messages, newMessageData];
      setMessages(updatedMessages);
      mockMessages[currentRoom.id] = updatedMessages;
      
      // Reset input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRoomAdmin = currentRoom && roomMembers.some(
    member => member.user_id === currentUserId && member.role === 'admin'
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Rooms</h2>
            <button
              onClick={() => setShowNewRoomDialog(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg pl-9 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentRoom?.id === room.id
                  ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium dark:text-white">{room.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {room.members}
                </span>
              </div>
              {room.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {room.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentRoom.name}
                </h2>
                {currentRoom.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentRoom.description}
                  </p>
                )}
              </div>
              {isRoomAdmin && (
                <button
                  onClick={() => {
                    setEditRoom({
                      name: currentRoom.name,
                      description: currentRoom.description
                    });
                    setShowSettingsDialog(true);
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="text-indigo-700 dark:text-indigo-200 font-medium">
                      {message.user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {message.user.email}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(message.created_at), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Select a chat room to start messaging</p>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      {showSettingsDialog && currentRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Room Settings</h2>
              <button
                onClick={() => setShowSettingsDialog(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Room Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Room Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={editRoom.name}
                      onChange={(e) => setEditRoom({ ...editRoom, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={editRoom.description}
                      onChange={(e) => setEditRoom({ ...editRoom, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Members</h3>
                <div className="space-y-4">
                  {roomMembers.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.role}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.user_id, e.target.value as 'admin' | 'member')}
                          className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => removeMember(member.user_id)}
                          className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Room
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowSettingsDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={updateRoomSettings}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Room</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this room? This action cannot be undone and all messages will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={deleteRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Room Dialog */}
      {showNewRoomDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Chat Room</h2>
              <button
                onClick={() => setShowNewRoomDialog(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createRoom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter room name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Enter room description"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewRoomDialog(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}