"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${segment}`,
    }));

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <a
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </a>
      {segments.map((segment, index) => (
        <div key={segment.href} className="flex items-center">
          <ChevronRight className="h-4 w-4" />
          <a
            href={segment.href}
            className={`ml-1 hover:text-foreground transition-colors ${
              index === segments.length - 1 ? "text-foreground font-medium" : ""
            }`}
          >
            {segment.name}
          </a>
        </div>
      ))}
    </nav>
  );
}
