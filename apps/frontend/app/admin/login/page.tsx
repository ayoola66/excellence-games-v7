"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AdminLoginForm } from "./login-form";
import ErrorBoundary from "@/components/ErrorBoundary";

// Metadata moved to layout.tsx since this is now a client component

export default function AdminLoginPage() {
  useEffect(() => {
    console.log("[AdminLoginPage] Component mounted");
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Portal
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Restricted access - Administrators only
            </p>
          </div>

          <AdminLoginForm />

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Return to Main Site
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is a secure area. Unauthorized access attempts will be logged
              and reported.
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
