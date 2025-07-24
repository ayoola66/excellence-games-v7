"use client";

export default function AdminMusic() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Music</h1>
        <p className="text-gray-400">
          Music management functionality coming soon
        </p>
      </div>

      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">
            Music Management
          </h3>
          <p className="text-gray-400 mb-4">
            This feature is under development and will be available in Phase 2.
          </p>
          <div className="text-sm text-gray-500">
            Features planned:
            <ul className="mt-2 space-y-1">
              <li>• Upload background music</li>
              <li>• Manage music library</li>
              <li>• Assign music to games</li>
              <li>• Audio settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
