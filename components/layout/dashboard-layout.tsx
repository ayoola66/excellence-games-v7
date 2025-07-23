"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { LogoSM } from "@/components/ui/logo";
import { DashboardFooter } from "@/components/dashboard/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: "home" },
    { href: "/dashboard/games", label: "Games", icon: "games" },
    { href: "/dashboard/game-history", label: "Game History", icon: "history" },
    { href: "/dashboard/profile", label: "Profile", icon: "profile" },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <Link
            href="/"
            className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2"}`}
          >
            <LogoSM variant="gold" />
            {!isCollapsed && (
              <div>
                <h1 className="text-sm font-semibold text-gray-900">
                  Excellence
                </h1>
                <p className="text-xs text-gray-500">Games</p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Collapse menu"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[#FFB800] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                } ${isCollapsed ? "justify-center" : "space-x-3"}`}
              >
                <span className="w-5 h-5">
                  {item.icon === "home" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  )}
                  {item.icon === "games" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  )}
                  {item.icon === "history" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {item.icon === "profile" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                  {item.icon === "settings" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-3">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2"}`}
          >
            <div className="w-7 h-7 rounded-full bg-[#FFB800] flex items-center justify-center text-white text-sm font-medium">
              {session?.user?.email?.[0].toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.email || "User"}
                </p>
                <Badge
                  variant={
                    session?.user?.email?.includes("premium")
                      ? "gold"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {session?.user?.email?.includes("premium")
                    ? "Premium"
                    : "Free"}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="p-2 border-t border-gray-200 mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              isCollapsed ? "justify-center" : "space-x-3"
            }`}
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Expand Button (when collapsed) */}
        {isCollapsed && (
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Expand menu"
            >
              <svg
                className="w-4 h-4 text-gray-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content + Footer */}
      <main className="relative flex-1 flex flex-col overflow-auto">
        {/* Membership Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium shadow-md ${
              session?.user?.email?.includes("premium")
                ? "bg-[#FFB800] text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {session?.user?.email?.includes("premium") ? "Premium" : "Free"}
          </span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
        <DashboardFooter />
      </main>
    </div>
  );
}
