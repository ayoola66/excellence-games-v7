"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FullPageLoading } from "@/components/ui/LoadingFallback";

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { admin, isLoading } = useAuth();

  useEffect(() => {
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
    return <FullPageLoading message="Checking authentication..." />;
  }

  // If admin is logged in, show loading while redirecting
  if (admin) {
    return <FullPageLoading message="Redirecting to dashboard..." />;
  }

  // Only render login page if not authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      {children}
    </div>
  );
}
