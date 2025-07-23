"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4">Elite Games</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The Ultimate British Trivia Experience. Challenge yourself with
              thousands of curated questions and compete in live tournaments.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/games"
                className="hover:text-foreground transition-colors"
              >
                Games
              </Link>
              <Link
                href="/shop"
                className="hover:text-foreground transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/tournaments"
                className="hover:text-foreground transition-colors"
              >
                Tournaments
              </Link>
              <Link
                href="/blog"
                className="hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                href="/help"
                className="hover:text-foreground transition-colors"
              >
                Help Centre
              </Link>
              <Link
                href="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="hover:text-foreground transition-colors"
              >
                FAQs
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>123 Game Street</p>
              <p>London, UK</p>
              <p>SW1A 1AA</p>
              <a
                href="mailto:support@elitegames.com"
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                support@elitegames.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Elite Games. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground mt-4 md:mt-0">
            <Link
              href="/accessibility"
              className="hover:text-foreground transition-colors"
            >
              Accessibility
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-foreground transition-colors"
            >
              Sitemap
            </Link>
            <Link
              href="/cookies"
              className="hover:text-foreground transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
