'use client';

import React, { useState } from 'react';
import { Plus, LogIn, Users, Target, TrendingUp, Shield } from 'lucide-react';
import { RoomCard } from '@repo/ui';
import { InfoCard } from '@repo/ui';
import { CreateRoomModal } from '@repo/ui';
import { JoinRoomModal } from '@repo/ui';

const RoomsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Mock data - replace with actual API calls
  const rooms = [
    {
      id: '1',
      name: 'NEET Preparation 2025',
      memberCount: 24,
      totalStudyTime: 1280,
      rank: 1,
      lastActive: '2 hours ago',
      color: '#6366f1'
    },
    {
      id: '2',
      name: 'JEE Advanced Squad',
      memberCount: 18,
      totalStudyTime: 956,
      rank: 2,
      lastActive: '5 hours ago',
      color: '#8b5cf6'
    },
    {
      id: '3',
      name: 'Medical Study Group',
      memberCount: 12,
      totalStudyTime: 645,
      lastActive: '1 day ago',
      color: '#ec4899'
    }
  ];

  const handleCreateRoom = (roomName: string, isPrivate: boolean) => {
    console.log('Creating room:', roomName, isPrivate);
    // Add your API call here
    setIsCreateModalOpen(false);
  };

  const handleJoinRoom = (inviteCode: string) => {
    console.log('Joining room with code:', inviteCode);
    // Add your API call here
    setIsJoinModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Study Rooms
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Collaborate with peers, track progress, and stay motivated together
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Plus size={24} />
            <span>Create New Room</span>
          </button>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:border-indigo-600 dark:hover:border-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <LogIn size={24} />
            <span>Join Existing Room</span>
          </button>
        </div>

        {/* Info Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Why Study Rooms?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard
              icon={Users}
              title="Collaborative Learning"
              description="Study together with friends and peers who share similar goals"
              color="#6366f1"
            />
            <InfoCard
              icon={Target}
              title="Track Progress"
              description="Monitor your study time and compare with room members"
              color="#8b5cf6"
            />
            <InfoCard
              icon={TrendingUp}
              title="Stay Motivated"
              description="Compete on leaderboards and celebrate achievements together"
              color="#ec4899"
            />
            <InfoCard
              icon={Shield}
              title="Private & Secure"
              description="Create private rooms with invite-only access for your group"
              color="#10b981"
            />
          </div>
        </div>

        {/* My Rooms Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Rooms
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
            </span>
          </div>

          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} {...room} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
              <Users size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Rooms Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a new room or join an existing one to get started
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-6 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
      />
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={handleJoinRoom}
      />
    </div>
  );
};

export default RoomsPage;