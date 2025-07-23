"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCheck } from "./auth-check";
import {
  LayoutDashboard,
  GamepadIcon,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ShoppingBag,
  Package,
  Music,
  BarChart,
  Tag,
  UserCog,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: GamepadIcon, label: "Games", href: "/admin/games" },
  { icon: HelpCircle, label: "Questions", href: "/admin/questions" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: ShoppingBag, label: "Store", href: "/admin/store" },
  { icon: Package, label: "Orders", href: "/admin/orders" },
  { icon: Music, label: "Music", href: "/admin/music" },
  { icon: BarChart, label: "Analytics", href: "/admin/analytics" },
  { icon: Tag, label: "Coupons", href: "/admin/coupons" },
  { icon: FileText, label: "Pages", href: "/admin/pages" },
  { icon: UserCog, label: "Admins", href: "/admin/admins" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Call the enhanced logout API
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Signed out successfully");
        router.push("/admin/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
      // Force redirect anyway
      router.push("/admin/login");
    }
  };

  return (
    <AuthCheck>
      <div
        className={`min-h-screen flex ${theme === "light" ? "bg-gray-50" : "bg-[#0A0A0A]"}`}
      >
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
          } ${
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-[#1A1A1A] border-gray-800"
          } border-r`}
        >
          {/* Logo */}
          <div
            className={`h-16 flex items-center px-4 border-b ${
              theme === "light" ? "border-gray-200" : "border-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FFB800] rounded flex items-center justify-center flex-shrink-0">
                <span className="text-black text-lg font-bold">E</span>
              </div>
              {!collapsed && (
                <span
                  className={`font-semibold whitespace-nowrap ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Admin Portal
                </span>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`ml-auto p-1 ${
                theme === "light"
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-[#FFB800] text-black font-medium"
                      : theme === "light"
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              ))}
            </div>
          </nav>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className={`absolute bottom-4 left-0 right-0 mx-4 flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
              theme === "light"
                ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          {/* Top Bar */}
          <div
            className={`sticky top-0 z-10 h-16 flex items-center justify-end px-6 ${
              theme === "light"
                ? "bg-white border-b border-gray-200"
                : "bg-[#1A1A1A] border-b border-gray-800"
            }`}
          >
            <ThemeSwitcher />
          </div>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthCheck>
  );
}
