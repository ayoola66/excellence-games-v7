"use client";

import { useState } from "react";
import { DashboardErrorBoundary } from "./error-boundary";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { DashboardFooter } from "./footer";
import { Breadcrumb } from "./breadcrumb";
import { cn } from "@/lib/utils";
import { isPremium } from "@/lib/user";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Music,
  GamepadIcon,
  History,
  Settings,
  Crown,
  UserCircle,
} from "lucide-react";
import { UserNav } from "@/components/dashboard/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const userIsPremium = isPremium(session?.user);

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: GamepadIcon, label: "Games", href: "/dashboard/games" },
    { icon: History, label: "Game History", href: "/dashboard/history" },
    {
      icon: Crown,
      label: "Premium Features",
      href: "/dashboard/premium",
      premium: true,
    },
    {
      icon: Music,
      label: "Music Upload",
      href: "/dashboard/music",
      premium: true,
    },
    { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <nav
        className={cn(
          "fixed left-0 top-0 z-40 h-full border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          collapsed ? "w-16" : "w-64",
          "transition-all duration-300",
          "md:translate-x-0",
          "transform -translate-x-full",
          !collapsed && "sm:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div
            className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center"
            )}
          >
            {!collapsed && <span className="text-xl font-bold">Elite Games</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 hover:bg-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="space-y-4 py-4">
          <div className="px-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                if (item.premium && !userIsPremium) return null;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      collapsed ? "justify-center" : "justify-start gap-3",
                      pathname === item.href ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <DashboardErrorBoundary>
        <div
          className={cn(
            "min-h-screen",
            "ml-0 sm:ml-64 md:ml-64",
            collapsed && "sm:ml-16 md:ml-16",
            "transition-all duration-300"
          )}
        >
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex flex-col gap-1">
              <Breadcrumb />
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="container py-6">{children}</main>
        <DashboardFooter />
      </div>
      </DashboardErrorBoundary>
    </div>
  );
}
