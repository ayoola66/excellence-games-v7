'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  PlayIcon, 
  StarIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  GlobeEuropeAfricaIcon,
  TrophyIcon,
  UsersIcon,
  CogIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid'

export default function LandingPage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState('premium')

  const packages = [
    {
      id: 'basic',
      name: 'Basic Edition',
      price: '£49.99',
      description: 'Perfect for families starting their trivia journey',
      features: [
        '200 Classic Trivia Questions',
        'Basic Game Board',
        'Player Pieces & Dice',
        'Quick Start Guide',
        'Digital Access to Basic Games'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Edition',
      price: '£89.99',
      description: 'The complete Elite Games experience with exclusive content',
      features: [
        '500+ Premium Questions',
        'Deluxe Wooden Game Board',
        'Premium Metal Player Pieces',
        'Digital Premium Subscription (6 months)',
        'Exclusive Question Categories',
        'Music Cards & Sound Effects',
        'Strategy Guide & Tips'
      ],
      popular: true
    },
    {
      id: 'collectors',
      name: 'Collector\'s Edition',
      price: '£149.99',
      description: 'Limited edition for the ultimate trivia enthusiast',
      features: [
        '1000+ Expert Questions',
        'Hand-crafted Oak Game Board',
        'Gold-plated Player Pieces',
        'Lifetime Digital Premium Access',
        'All Question Categories',
        'Personalised Engraving',
        'Certificate of Authenticity',
        'VIP Customer Support'
      ],
      popular: false
    }
  ]

  const testimonials = [
    {
      name: 'Sarah & James Wilson',
      location: 'Manchester',
      rating: 5,
      text: 'Absolutely brilliant! Our family game nights have never been more engaging. The questions are challenging yet fair, and the quality is exceptional.'
    },
    {
      name: 'Dr. Margaret Thompson',
      location: 'Edinburgh',
      rating: 5,
      text: 'As an educator, I appreciate the thoughtful categorisation and difficulty progression. Elite Games makes learning genuinely enjoyable.'
    },
    {
      name: 'The Patel Family',
      location: 'Birmingham',
      rating: 5,
      text: 'Three generations playing together! The game scales beautifully from children to grandparents. Brilliant British quality throughout.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-xl mr-4">
                <PlayIcon className="h-8 w-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Elite Games</h1>
                <p className="text-xs text-blue-600 font-medium">Premium Board Games</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="btn-secondary"
              >
                Play Online
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('packages')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-primary"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                The Ultimate
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300"> British Trivia</span>
                Board Game
              </h2>
              <p className="text-xl mb-8 leading-relaxed text-blue-100">
                Handcrafted in Britain with over 1000 meticulously researched questions spanning 
                history, culture, science, and entertainment. Perfect for family gatherings and 
                competitive friends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const element = document.getElementById('packages')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-xl hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  Shop Now
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-white/10 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg flex items-center justify-center gap-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  Try Digital Version
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-yellow-400 rounded-xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Free Digital Access Included!</h3>
                  <p className="text-blue-800">Every board game purchase includes 6 months of premium digital access</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-yellow-400" />
                    <span>Handcrafted in the United Kingdom</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-yellow-400" />
                    <span>Premium quality materials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-yellow-400" />
                    <span>1000+ carefully researched questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-yellow-400" />
                    <span>Perfect for 2-8 players</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-blue-900 mb-6">
              Why Elite Games Board Game?
            </h3>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Experience the perfect blend of traditional board gaming and modern innovation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center group"
            >
              <div className="bg-yellow-400 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <TrophyIcon className="h-10 w-10 text-blue-900" />
              </div>
              <h4 className="text-2xl font-bold text-blue-900 mb-4">Premium Quality</h4>
              <p className="text-blue-700 leading-relaxed">
                Handcrafted with the finest British materials, from sustainably sourced wood to precision-cut game pieces.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center group"
            >
              <div className="bg-yellow-400 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <QuestionMarkCircleIcon className="h-10 w-10 text-blue-900" />
              </div>
              <h4 className="text-2xl font-bold text-blue-900 mb-4">Expertly Crafted Questions</h4>
              <p className="text-blue-700 leading-relaxed">
                Over 1000 questions researched and fact-checked by British educators and trivia experts.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center group"
            >
              <div className="bg-yellow-400 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <UsersIcon className="h-10 w-10 text-blue-900" />
              </div>
              <h4 className="text-2xl font-bold text-blue-900 mb-4">Perfect for Everyone</h4>
              <p className="text-blue-700 leading-relaxed">
                Designed for 2-8 players with scalable difficulty, perfect for family gatherings and competitive friends.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6">What Our Customers Say</h3>
            <p className="text-xl text-blue-200">Join thousands of satisfied families across the UK</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-blue-100 mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-blue-300 text-sm">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-blue-900 mb-6">Choose Your Edition</h3>
            <p className="text-xl text-blue-700">Select the perfect package for your family</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 ${
                  pkg.popular ? 'border-yellow-400 scale-105' : 'border-blue-100'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-blue-900 font-bold px-6 py-2 rounded-full text-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-blue-900 mb-2">{pkg.name}</h4>
                  <p className="text-blue-600 mb-4">{pkg.description}</p>
                  <div className="text-4xl font-bold text-blue-900">{pkg.price}</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-blue-800">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => {
                    // In a real app, this would integrate with a payment processor
                    alert(`Thank you for your interest in the ${pkg.name}! Payment integration coming soon.`)
                  }}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    pkg.popular
                      ? 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-lg'
                      : 'bg-blue-900 text-white hover:bg-blue-800'
                  }`}
                >
                  Choose {pkg.name}
                </button>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-6 py-3 rounded-full">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">30-day money-back guarantee • Free UK shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-4xl font-bold mb-6">Ready to Elevate Your Game Night?</h3>
            <p className="text-xl text-blue-200 mb-8">
              Join thousands of families across the UK who have made Elite Games their go-to entertainment choice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const element = document.getElementById('packages')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-xl hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Order Your Board Game
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-white/10 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg flex items-center justify-center gap-2"
              >
                <PlayIcon className="h-5 w-5" />
                Try Digital First
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-blue-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-yellow-400 p-2 rounded-xl mr-3">
                  <PlayIcon className="h-6 w-6 text-blue-900" />
                </div>
                <span className="text-xl font-bold text-white">Elite Games</span>
              </div>
              <p className="text-sm leading-relaxed">
                Premium British trivia games designed to bring families and friends together through the joy of learning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Board Games</a></li>
                <li><a href="/" className="hover:text-yellow-400 transition-colors">Digital Games</a></li>
                <li><a href="#packages" className="hover:text-yellow-400 transition-colors">Premium Editions</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Customer Service</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Returns</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Elite Games. Proudly crafted in the United Kingdom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 