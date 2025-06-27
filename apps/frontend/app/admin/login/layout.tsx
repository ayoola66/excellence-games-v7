"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FullPageLoading } from "@/components/ui/LoadingFallback";
import ErrorBoundary from "@/components/ErrorBoundary";

// Metadata must be in a separate file for App Router
export const metadata = {
  title: "Admin Login | Elite Games",
  description: "Secure login portal for Elite Games administrators.",
  robots: "noindex, nofollow",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { admin, isLoading } = useAuth();

  useEffect(() => {
    console.log("[AdminLoginLayout] Mounted, auth state:", {
      isLoading,
      hasAdmin: !!admin,
    });

    // If admin is already logged in, redirect to dashboard
    if (!isLoading && admin) {
      console.log(
        "[AdminLoginLayout] Admin already logged in, redirecting to dashboard",
      );
      router.replace("/admin/dashboard");
    }
  }, [isLoading, admin, router]);

  // Show loading while checking auth
  if (isLoading) {
    console.log("[AdminLoginLayout] Showing loading state");
    return <FullPageLoading message="Checking authentication..." />;
  }

  // If admin is logged in, show loading while redirecting
  if (admin) {
    console.log("[AdminLoginLayout] Admin found, showing redirect loading");
    return <FullPageLoading message="Redirecting to dashboard..." />;
  }

  // Only render login page if not authenticated
  console.log("[AdminLoginLayout] Rendering login page");
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
        {children}
      </div>
    </ErrorBoundary>
  );
}
