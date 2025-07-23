"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-context";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Skip admin layout for login page
  if (pathname === "/admin/login") {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <AdminLayout>{children}</AdminLayout>
    </ThemeProvider>
  );
}
