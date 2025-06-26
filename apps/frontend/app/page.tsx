'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { CheckIcon, StarIcon, AcademicCapIcon, GlobeAltIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-2xl font-bold flex items-center gap-2">
              <Image
                src="/images/general-trivia-image-test-1.png"
                alt="Targeted Trivia Logo"
                width={50}
                height={50}
                className="rounded-full object-contain"
                priority
              />
              Targeted Trivia
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition">Login</Link>
            </nav>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="block">Elite Games</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Ultimate Trivia Challenge</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Play our 'General Trivia' for free, or subscribe to unlock dozens of categories and top the leaderboards. Passwordless login makes it easy to start.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg">Start Playing Now</Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" size="lg">Learn More</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Why You'll Love Targeted Trivia</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              We've built a trivia platform that's fun for casual players and challenging for the most dedicated quiz masters.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <StarIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Endless Categories</h3>
              <p className="text-gray-400">Subscribe to unlock specialized categories from Science and History to Pop Culture and more.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <GlobeAltIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Compete Globally</h3>
              <p className="text-gray-400">Climb the leaderboards in free and premium categories to prove you're the ultimate trivia champion.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <BoltIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Passwordless Access</h3>
              <p className="text-gray-400">No passwords to remember. Get a magic link sent straight to your email for secure, easy access.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <AcademicCapIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Learn & Grow</h3>
              <p className="text-gray-400">It's not just a game. Expand your knowledge with every question you answer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Choose Your Plan</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Start for free, and upgrade anytime to unlock the full Targeted Trivia experience.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 flex flex-col">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <p className="text-gray-400 mb-6 flex-grow">For the casual player who wants to test the waters.</p>
              <div className="text-4xl font-bold mb-6">
                $0 <span className="text-lg font-normal text-gray-400">/ month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><CheckIcon className="w-6 h-6 text-green-500 mr-3" /> General Trivia Category</li>
                <li className="flex items-center"><CheckIcon className="w-6 h-6 text-green-500 mr-3" /> Public Leaderboards</li>
              </ul>
              <Button variant="secondary" size="lg" className="mt-auto w-full">Current Plan</Button>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg border border-purple-500 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 text-sm font-bold rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Premium</h3>
              <p className="text-blue-100 mb-6 flex-grow">For the dedicated champion who wants it all.</p>
              <div className="text-4xl font-bold mb-6 text-white">
                $9.99 <span className="text-lg font-normal text-blue-100">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-center"><CheckIcon className="w-6 h-6 text-yellow-300 mr-3" /> Everything in Free, plus...</li>
                <li className="flex items-center"><CheckIcon className="w-6 h-6 text-yellow-300 mr-3" /> Access to All Categories</li>
                <li className="flex items-center"><CheckIcon className="w-6 h-6 text-yellow-300 mr-3" /> Ad-Free Experience</li>
                <li className="flex items-center"><CheckIcon className="w-6 h-6 text-yellow-300 mr-3" /> Advanced Statistics</li>
                <li className="flex items-center"><CheckIcon className="w-6 h-6 text-yellow-300 mr-3" /> Priority Support</li>
              </ul>
               <Link href="/register?plan=premium" className="w-full">
                <Button variant="primary" size="lg" className="mt-auto w-full bg-white text-blue-600 hover:bg-gray-200">Go Premium</Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Targeted Trivia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
} 