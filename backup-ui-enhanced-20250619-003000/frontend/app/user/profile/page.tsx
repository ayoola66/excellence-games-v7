'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { strapiApi } from '@/lib/strapiApi';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  subscriptionStatus?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (authUser) {
          // We can use the user from context directly
          setUserData({
            id: authUser.id,
            username: authUser.username,
            email: authUser.email,
            fullName: authUser.fullName,
            subscriptionStatus: authUser.subscriptionStatus,
            createdAt: new Date().toISOString(), // This might need to be fetched if not in context
          });
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserProfile();
    } else if (!authLoading) {
      router.push('/login?from=/user/profile');
    }
  }, [authUser, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const isPremium = userData.subscriptionStatus === 'premium';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{userData.username}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium">
                  {isPremium ? (
                    <span className="text-green-600">Premium</span>
                  ) : (
                    <span>Free</span>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            
            {isPremium ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-700 font-medium">
                  You have an active premium subscription
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Enjoy unlimited access to all premium games!
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-700 font-medium">
                  Upgrade to Premium
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Get access to all premium games and features.
                </p>
                <button
                  onClick={() => router.push('/user/subscription')}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => router.push('/user/games')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Games
        </button>
        
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 