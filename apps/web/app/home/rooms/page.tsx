'use client';

import React, { useState, useEffect } from 'react';
import { Plus, LogIn, Users, Target, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { RoomCard } from '@repo/ui';
import { InfoCard } from '@repo/ui';
import { CreateRoomModal } from '@repo/ui';
import { JoinRoomModal } from '@repo/ui';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Room {
  id: string;
  name: string;
  description: string | null;
  roomCode: string;
  isPublic: boolean;
  hostId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    participants: number;
  };
}

const RoomsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const { data: session } = useSession();

  // Loading states
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms on component mount
  useEffect(() => {
    if (session?.accessToken) {
      fetchMyRooms();
    }
  }, [session]);

  const fetchMyRooms = async () => {
    setIsLoadingRooms(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/get-my-rooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch rooms');
      }

      setMyRooms(data.rooms || []);
      console.log('Fetched rooms:', data.rooms);

    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setError(error.message);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleCreateRoom = async (roomName: string, isPrivate: boolean, roomDiscription: string) => {
    setIsCreatingRoom(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          name: roomName,
          description: roomDiscription,
          isPublic: !isPrivate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room');
      }

      console.log('Room created successfully:', data.room);
      toast.success(`Room created! Code: ${data.room.roomCode}`);
      
      // Close modal
      setIsCreateModalOpen(false);
      
      // Refresh the rooms list
      await fetchMyRooms();

    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error(error.message || 'Failed to create room');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = (inviteCode: string) => {
    console.log('Joining room with code:', inviteCode);
    // Add your API call here
    setIsJoinModalOpen(false);
  };

  // Transform API room data to RoomCard format
  const transformRoomData = (room: Room) => ({
    id: room.id,
    name: room.name,
    memberCount: room._count?.participants || 0,
    totalStudyTime: 0, // Will need to add this from your API
    rank: 0, // Will need to calculate this
    lastActive: new Date(room.updatedAt).toLocaleDateString(),
    color: getRandomColor()
  });

  const getRandomColor = () => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Loading skeleton for room cards
  const RoomCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  );

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
            disabled={isCreatingRoom}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCreatingRoom ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus size={24} />
                <span>Create New Room</span>
              </>
            )}
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
            {!isLoadingRooms && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {myRooms.length} {myRooms.length === 1 ? 'room' : 'rooms'}
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoadingRooms && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          )}

          {/* Error State */}
          {error && !isLoadingRooms && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchMyRooms}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingRooms && !error && myRooms.length === 0 && (
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

          {/* Rooms Grid */}
          {!isLoadingRooms && !error && myRooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.map((room) => (
                <RoomCard key={room.id} {...transformRoomData(room)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
        isLoading={isCreatingRoom}
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