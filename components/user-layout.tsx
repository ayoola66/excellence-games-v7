"use client";

import { useState } from "react";
import { isPremium } from "@/lib/user";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  GamepadIcon,
  Trophy,
  Music,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  CreditCard,
} from "lucide-react";

interface UserLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Games",
    href: "/games",
    icon: GamepadIcon,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    name: "Premium",
    href: "/premium",
    icon: Crown,
  },
  {
    name: "Music",
    href: "/music",
    icon: Music,
    premiumOnly: true,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
    premiumOnly: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function UserLayout({ children }: UserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  // Filter navigation items based on user premium status
  const visibleNavItems = navigationItems.filter((item) => {
    if (item.premiumOnly) {
      return isPremium(session?.user);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent pathname={pathname} onSignOut={handleSignOut} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
          <SidebarContent pathname={pathname} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onSignOut,
}: {
  pathname: string;
  onSignOut: () => void;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4 mb-5">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="Elite Games Platform"
              fill
              sizes="(max-width: 768px) 40px, 40px"
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Elite Games Platform
          </span>
        </Link>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigationItems.map((item) => {
          const userIsPremium = isPremium(session?.user);
          if (item.premiumOnly && !userIsPremium) return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150
                ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 flex-shrink-0 h-6 w-6
                  ${
                    isActive
                      ? "text-gray-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }
                `}
                aria-hidden="true"
              />
              {item.name}
              {item.premiumOnly && (
                <Crown className="ml-2 h-4 w-4 text-yellow-500" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 mt-6">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-gray-900"
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
