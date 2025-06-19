'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { strapiApi } from '@/lib/strapiApi';

export default function SubscriptionPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // In a real application, this would integrate with a payment processor
      // For now, we'll simulate a successful upgrade
      await strapiApi.upgradeToPremium();
      
      // Update the session to reflect premium status
      await update({ premium: true });
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/user/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Error upgrading subscription:', err);
      setError(err.message || 'Failed to upgrade subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login?from=/user/subscription');
    return null;
  }

  // If user already has premium
  if (session?.user?.premium) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Premium Subscription</h1>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-700 font-medium">
              You already have an active premium subscription!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Enjoy unlimited access to all premium games and features.
            </p>
          </div>
          
          <Link 
            href="/user/games" 
            className="w-full block text-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Browse Premium Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Upgrade to Premium</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-700 font-medium">
              Subscription upgraded successfully!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Redirecting to your profile...
            </p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Premium Benefits
              </h2>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Access to all premium games</li>
                <li>Exclusive content and features</li>
                <li>Ad-free experience</li>
                <li>Priority support</li>
              </ul>
            </div>
            
            <div className="border rounded-md p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Premium Subscription</h3>
                <span className="text-xl font-bold">£9.99/month</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Billed monthly. Cancel anytime.
              </p>
              
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  isProcessing 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
          </>
        )}
        
        <div className="flex justify-between">
          <Link 
            href="/user/games" 
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Games
          </Link>
          
          <Link 
            href="/user/profile" 
            className="text-indigo-600 hover:text-indigo-800"
          >
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
} 