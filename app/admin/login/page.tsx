"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      const from = searchParams.get("from");
      router.push(from && from !== "/admin/login" ? from : "/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-[#0A0A0A]"} flex`}
    >
      {/* Small top bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#FFB800]" />

      {/* Theme Switcher */}
      <div className="fixed top-4 right-4">
        <ThemeSwitcher />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[420px] p-8">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#FFB800] rounded-lg flex items-center justify-center">
              <span className="text-black text-2xl font-bold">E</span>
            </div>
          </div>

          {/* Title */}
          <h1
            className={`text-3xl font-bold text-center mb-2 ${
              theme === "light" ? "text-gray-900" : "text-[#FFB800]"
            }`}
          >
            Admin Portal
          </h1>
          <p
            className={`text-sm text-center mb-8 ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Access the Excellence Games management system
          </p>

          {/* Login Form */}
          <div
            className={`rounded-lg p-6 mb-6 ${
              theme === "light"
                ? "bg-white shadow-sm border border-gray-200"
                : "bg-[#1A1A1A] border border-gray-800"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-1.5 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded text-sm ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-900 focus:ring-[#FFB800] focus:border-[#FFB800]"
                      : "bg-[#0A0A0A] border-gray-800 text-white focus:ring-[#FFB800] focus:border-[#FFB800]"
                  } border focus:outline-none focus:ring-1`}
                  placeholder="admin@elitegames.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-1.5 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded text-sm ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-900 focus:ring-[#FFB800] focus:border-[#FFB800]"
                      : "bg-[#0A0A0A] border-gray-800 text-white focus:ring-[#FFB800] focus:border-[#FFB800]"
                  } border focus:outline-none focus:ring-1`}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FFB800] text-black font-semibold py-2 px-4 rounded hover:bg-[#E5A700] focus:outline-none focus:ring-2 focus:ring-[#FFB800] focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="text-center">
            <Link
              href="/contact"
              className={`text-sm ${
                theme === "light"
                  ? "text-gray-600 hover:text-gray-900"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              Contact system administrator
            </Link>
          </div>
        </div>
      </div>

      {/* Version */}
      <div className="fixed bottom-4 right-4">
        <p
          className={`text-xs ${
            theme === "light" ? "text-gray-500" : "text-gray-600"
          }`}
        >
          Excellence Games Admin v1.0
        </p>
      </div>
    </div>
  );
}
