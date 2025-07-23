"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApiClient, DashboardStats } from "@/lib/admin-api-client";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Users,
  GamepadIcon,
  Tag,
  LayoutDashboard,
  FileText,
  Settings,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 3000),
        );

        const statsPromise = adminApiClient.getDashboardStats();
        const dashboardStats = (await Promise.race([
          statsPromise,
          timeoutPromise,
        ])) as any;

        setStats(dashboardStats);
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        const errorMessage =
          err.message || "Failed to load dashboard statistics";
        setError(errorMessage);

        // Set default stats to prevent blank dashboard
        setStats({
          totalGames: 0,
          totalUsers: 0,
          activeGames: 0,
          totalCategories: 0,
        });

        // Don't show toast for timeout errors to prevent spam
        if (
          !errorMessage.includes("timeout") &&
          !errorMessage.includes("Request timeout")
        ) {
          toast({
            title: "Warning",
            description:
              "Dashboard statistics could not be loaded. Showing default values.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch once, don't retry on error to prevent refresh loop
    fetchStats();
  }, []); // Remove toast dependency to prevent re-runs

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome to the Excellence Games admin portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <GamepadIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Games</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? "..." : stats?.totalGames || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? "..." : stats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <GamepadIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Games</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? "..." : stats?.activeGames || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? "..." : stats?.totalCategories || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/games"
          className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800 hover:border-[#FFB800] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB800]/10 rounded-lg flex items-center justify-center group-hover:bg-[#FFB800]/20 transition-colors">
              <LayoutDashboard className="h-5 w-5 text-[#FFB800]" />
            </div>
            <div>
              <p className="font-medium text-white">Games</p>
              <p className="text-sm text-gray-400">Manage games and content</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/pages"
          className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800 hover:border-[#FFB800] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB800]/10 rounded-lg flex items-center justify-center group-hover:bg-[#FFB800]/20 transition-colors">
              <FileText className="h-5 w-5 text-[#FFB800]" />
            </div>
            <div>
              <p className="font-medium text-white">Pages</p>
              <p className="text-sm text-gray-400">Edit website content</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800 hover:border-[#FFB800] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB800]/10 rounded-lg flex items-center justify-center group-hover:bg-[#FFB800]/20 transition-colors">
              <Settings className="h-5 w-5 text-[#FFB800]" />
            </div>
            <div>
              <p className="font-medium text-white">Settings</p>
              <p className="text-sm text-gray-400">Configure system settings</p>
            </div>
          </div>
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
