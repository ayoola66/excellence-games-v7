"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-white"}`}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          theme === "dark"
            ? "bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-b border-white/5"
            : "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4">
              <Image
                src={
                  theme === "dark"
                    ? "/images/Excellence-Games-Logo-Gold.png"
                    : "/images/Excellence-Games-Logo-Black.png"
                }
                alt="Excellence Games"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
              <div>
                <h1
                  className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}
                >
                  Excellence Games
                </h1>
                <p
                  className={
                    theme === "dark" ? "text-white/60" : "text-black/60"
                  }
                >
                  Home of competitive games that shape character
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/shop">
                <Button variant="ghost">Our Games</Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost">About</Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost">Contact</Button>
              </Link>
              {session ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <Link href="/auth/signin">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-black"}`}
            >
              Welcome to Excellence Games
            </h2>
            <p
              className={`text-xl mb-8 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}
            >
              Experience our collection of engaging games designed to challenge
              and inspire
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-[#FFB800] text-black hover:bg-[#FFC633]"
                >
                  Explore Games
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section
        className={`py-16 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className={`text-3xl font-bold mb-8 text-center ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            Featured Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Game Cards */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-lg overflow-hidden ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="aspect-video relative">
                  <Image
                    src={`/images/game-${i}.jpg`}
                    alt={`Game ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3
                    className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}
                  >
                    Game Title {i}
                  </h3>
                  <p
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    A brief description of the game and its unique features.
                  </p>
                  <Button className="mt-4">Learn More</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={
          theme === "dark" ? "bg-black text-white" : "bg-gray-900 text-white"
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/images/Excellence-Games-Logo-Gold.png"
                  alt="Excellence Games"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                  priority
                />
                <h3 className="text-xl font-semibold">Excellence Games</h3>
              </div>
              <p className="text-white/60">
                Home of competitive games that shape character & connection.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Our Games</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/games/uk-edition"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    UK Edition
                  </Link>
                </li>
                <li>
                  <Link
                    href="/games/black-edition"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Black Edition
                  </Link>
                </li>
                <li>
                  <Link
                    href="/games/urban-edition"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Urban Edition
                  </Link>
                </li>
                <li>
                  <Link
                    href="/games/targeted"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Targeted
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com/excellencegames"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com/excellencegames"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/excellencegames"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/excellencegames"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/60">
            <p>
              &copy; {new Date().getFullYear()} Excellence Games. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
