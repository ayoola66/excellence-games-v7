"use client";

export default function AdminOrders() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">
          Order management functionality coming soon
        </p>
      </div>

      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">
            Orders Management
          </h3>
          <p className="text-gray-400 mb-4">
            This feature is under development and will be available in Phase 2.
          </p>
          <div className="text-sm text-gray-500">
            Features planned:
            <ul className="mt-2 space-y-1">
              <li>• View all orders</li>
              <li>• Order status management</li>
              <li>• Payment tracking</li>
              <li>• Customer order history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
