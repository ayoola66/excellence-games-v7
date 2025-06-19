'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('An authentication error occurred');

  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error === 'CredentialsSignin') {
      setErrorMessage('Invalid email or password');
    } else if (error === 'AccessDenied') {
      setErrorMessage('Access denied. You do not have permission to access this resource.');
    } else if (error === 'OAuthSignin') {
      setErrorMessage('Error during OAuth sign in');
    } else if (error === 'OAuthCallback') {
      setErrorMessage('Error during OAuth callback');
    } else if (error === 'OAuthCreateAccount') {
      setErrorMessage('Error creating OAuth account');
    } else if (error === 'EmailCreateAccount') {
      setErrorMessage('Error creating email account');
    } else if (error === 'Callback') {
      setErrorMessage('Error during callback');
    } else if (error === 'Configuration') {
      setErrorMessage('Server configuration error');
    } else {
      setErrorMessage('An authentication error occurred');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link 
            href="/auth/login" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Login
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 