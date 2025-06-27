"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Toast {
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export function AdminLoginForm() {
  const router = useRouter();
  const { setAdmin, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const showToast = (toast: Toast) => {
    // Simple toast implementation
    const toastElement = document.createElement("div");
    toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      toast.type === "success"
        ? "bg-green-100 border border-green-400 text-green-700"
        : toast.type === "error"
          ? "bg-red-100 border border-red-400 text-red-700"
          : "bg-blue-100 border border-blue-400 text-blue-700"
    }`;
    toastElement.innerHTML = `
      <div class="font-semibold">${toast.title}</div>
      <div class="text-sm">${toast.message}</div>
    `;
    document.body.appendChild(toastElement);

    setTimeout(() => {
      toastElement.remove();
    }, 5000);
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.type === "INVALID_CREDENTIALS") {
          setErrors({
            ...errors,
            general: "Invalid email or password",
          });
        } else if (data.error?.type === "RATE_LIMIT_EXCEEDED") {
          setErrors({
            ...errors,
            general: "Too many login attempts. Please try again later.",
          });
        } else {
          setErrors({
            ...errors,
            general: data.error?.message || "Login failed. Please try again.",
          });
        }
        throw new Error(data.error?.message || "Login failed");
      }

      if (!data.admin) {
        setErrors({
          ...errors,
          general: "Invalid response from server",
        });
        throw new Error("Invalid response from server");
      }

      // Update auth context with admin data
      setAdmin(data.admin);

      showToast({
        title: "Success",
        message: `Welcome back, ${data.admin.fullName || data.admin.email}!`,
        type: "success",
      });

      // Refresh auth context and wait for it to complete
      await refreshAuth();

      // Now safe to redirect
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        errors.general || error.message || "An error occurred during login";
      showToast({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Admin Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setErrors({ ...errors, email: "", general: "" });
            }}
            placeholder="Enter your admin email"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: "", general: "" });
            }}
            placeholder="Enter your admin password"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Signing in...
          </div>
        ) : (
          "Sign in as Admin"
        )}
      </button>
    </form>
  );
}
