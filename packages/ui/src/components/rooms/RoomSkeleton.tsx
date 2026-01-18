export function RoomSkeleton() {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-800 rounded-lg animate-pulse mb-4"></div>
          <div className="h-4 w-48 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 w-20 bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-6 mb-6 border-b border-gray-800">
          <div className="h-8 w-24 bg-gray-800 rounded-t animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-800 rounded-t animate-pulse"></div>
        </div>

        {/* Members Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-indigo-900 rounded-lg animate-pulse"></div>
        </div>

        {/* Member Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-800 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-16 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-16 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-12 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
