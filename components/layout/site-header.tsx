"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoLG } from "@/components/ui/logo";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.05);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-white shadow-md"
          : "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      } border-b border-black/5`}
    >
      <div className="excellence-container excellence-p-lg">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 group">
            <LogoLG variant="gold" />
            <div>
              <h1 className="excellence-heading-primary text-2xl">
                Excellence Games
              </h1>
              <p className="text-sm text-black/60">
                Home of competitive games that shape character
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/shop"
              className="excellence-btn-secondary h-9 flex items-center"
            >
              Our Games
            </Link>
            <Link
              href="/about"
              className="excellence-btn-secondary h-9 flex items-center"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="excellence-btn-secondary h-9 flex items-center"
            >
              Contact
            </Link>
            <Link
              href="/auth/signin"
              className="excellence-btn-secondary h-9 flex items-center"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="excellence-btn-primary h-9 flex items-center bg-[#FFB800] text-black hover:bg-[#FFC633]"
            >
              Free Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden excellence-btn-secondary h-9 flex items-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-4 pb-6 px-[20%]">
            <Link
              href="/shop"
              className="excellence-btn-secondary h-9 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Games
            </Link>
            <Link
              href="/about"
              className="excellence-btn-secondary h-9 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="excellence-btn-secondary h-9 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-black/5">
              <Link
                href="/auth/signin"
                className="excellence-btn-secondary h-9 flex items-center justify-center mb-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="excellence-btn-primary h-9 flex items-center justify-center bg-[#FFB800] text-black hover:bg-[#FFC633]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Free Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
