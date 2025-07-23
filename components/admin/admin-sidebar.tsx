"use client";

import {
  LayoutDashboard,
  GamepadIcon,
  HelpCircle,
  Users,
  ShoppingBag,
  BarChart2,
  Music,
  Tag,
  FileText,
  Settings,
  UserCog,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Games", href: "/admin/games", icon: GamepadIcon },
  { name: "Questions", href: "/admin/questions", icon: HelpCircle },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Store", href: "/admin/store", icon: ShoppingBag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Music", href: "/admin/music", icon: Music },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Pages", href: "/admin/pages", icon: FileText },
  { name: "Admins", href: "/admin/admins", icon: UserCog },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Clear admin session
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Redirect to login
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="w-64 bg-white shadow-sm">
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-semibold">Admin Portal</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`admin-sidebar-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-2 py-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
