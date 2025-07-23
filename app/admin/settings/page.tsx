"use client";

import { useTheme } from "@/lib/theme-context";
import { Sun, Moon, Monitor } from "lucide-react";

export default function AdminSettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <h1
        className={`text-3xl font-bold mb-2 ${
          theme === "light" ? "text-gray-900" : "text-white"
        }`}
      >
        Settings
      </h1>
      <p
        className={`text-sm mb-8 ${
          theme === "light" ? "text-gray-600" : "text-gray-400"
        }`}
      >
        Configure your admin portal preferences
      </p>

      {/* Theme Settings */}
      <div
        className={`rounded-lg border p-6 mb-8 ${
          theme === "light"
            ? "bg-white border-gray-200"
            : "bg-[#1A1A1A] border-gray-800"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          Appearance
        </h2>

        <div className="space-y-4">
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              theme === "light"
                ? "bg-gray-50 text-gray-900"
                : "bg-gray-800/50 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-[#FFB800]" />
              <div>
                <p className="font-medium">Light Mode</p>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  High contrast and better readability
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-4 h-4 rounded-full ${
                theme === "light" ? "bg-[#FFB800]" : "border border-gray-600"
              }`}
              aria-label="Select light mode"
            />
          </div>

          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              theme === "light"
                ? "bg-gray-50 text-gray-900"
                : "bg-gray-800/50 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-[#FFB800]" />
              <div>
                <p className="font-medium">Dark Mode</p>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Easier on the eyes in low-light conditions
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-4 h-4 rounded-full ${
                theme === "dark" ? "bg-[#FFB800]" : "border border-gray-600"
              }`}
              aria-label="Select dark mode"
            />
          </div>

          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              theme === "light"
                ? "bg-gray-50 text-gray-900"
                : "bg-gray-800/50 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-[#FFB800]" />
              <div>
                <p className="font-medium">System Theme</p>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Follow your system appearance settings
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // TODO: Implement system theme
              }}
              className="w-4 h-4 rounded-full border border-gray-600"
              aria-label="Use system theme"
            />
          </div>
        </div>

        <p
          className={`mt-4 text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          You can also quickly switch themes using the icon in the top-right
          corner of any page.
        </p>
      </div>

      {/* Other Settings Sections */}
      <div
        className={`rounded-lg border p-6 ${
          theme === "light"
            ? "bg-white border-gray-200"
            : "bg-[#1A1A1A] border-gray-800"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          Other Settings
        </h2>
        <p
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          More settings will be available soon.
        </p>
      </div>
    </div>
  );
}
