"use client";

import { SessionProvider } from "next-auth/react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import DashboardLayout from "./dashboard-layout";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme-context";
import { useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [queryClient] = useState(() => new QueryClient());
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  const isAdminRoute = pathname?.startsWith("/admin");
  const isHomePage = pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          {/* Handle inactivity logout */}
          {(() => {
            const InactivityHandler = () => {
              const { data: session } = require("next-auth/react").useSession();
              const {
                useInactivityLogout,
              } = require("@/hooks/use-inactivity-logout");
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useInactivityLogout(session?.user ? 5 * 60 * 1000 : undefined);
              return null;
            };
            return <InactivityHandler />;
          })()}
          {isDashboardRoute ? (
            <DashboardLayout>{children}</DashboardLayout>
          ) : (
            <>
              {!isAdminRoute && <SiteHeader />}
              <main className={isAdminRoute ? "" : "pt-20"}>{children}</main>
              {!isHomePage && !isAdminRoute && <SiteFooter />}
            </>
          )}
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
