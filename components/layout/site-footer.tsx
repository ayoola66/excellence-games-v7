"use client";

import Link from "next/link";
import Image from "next/image";

// Default footer links as fallback
const defaultLinks = {
  games: [
    { title: "UK Edition", href: "/shop" },
    { title: "Black Edition", href: "/shop" },
    { title: "Urban Edition", href: "/shop" },
    { title: "Targeted", href: "/shop" },
  ],
  company: [
    { title: "About Us", href: "/about" },
    { title: "Contact", href: "/contact" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="excellence-container py-16">
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
            <div className="mt-6 space-y-2">
              <Link
                href="/auth/register"
                className="excellence-btn-primary bg-[#FFB800] text-black hover:bg-[#FFC633] w-full justify-center h-9"
              >
                Free Sign Up
              </Link>
              <Link
                href="/auth/signin"
                className="excellence-btn-secondary w-full justify-center h-9"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Our Games</h4>
            <ul className="space-y-2">
              {defaultLinks.games.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {defaultLinks.company.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FFB800] transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="space-y-4">
              <p className="text-white/60">
                Excellence Games | Home of Excellence & Targeted 🎯
              </p>
              <p className="text-white/60">
                Board games that build character & connection.
              </p>
              <div className="pt-4">
                <p className="text-sm text-white/40 mb-2">
                  Ready to start playing?
                </p>
                <Link
                  href="/auth/register"
                  className="text-[#FFB800] hover:text-[#FFC633] transition-colors font-semibold"
                >
                  Create your free account →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/60">
            © {new Date().getFullYear()} Excellence Games. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
