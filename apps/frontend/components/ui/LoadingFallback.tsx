import React from 'react';

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-4">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export function FullPageLoading({ message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}

export default LoadingFallback; 