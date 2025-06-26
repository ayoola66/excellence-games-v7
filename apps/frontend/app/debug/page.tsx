"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function DebugPage() {
  const { user, admin, isLoading, authError } = useAuth()
  const [cookies, setCookies] = useState<string>('')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setCookies(document.cookie)
    }
  }, [])

  const testApi = async () => {
    setIsTestingApi(true)
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      setApiResponse({ error: String(error) })
    } finally {
      setIsTestingApi(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Auth Context State</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Is Loading:</strong> {String(isLoading)}</p>
            <p><strong>Auth Error:</strong> {authError || 'None'}</p>
          </div>
          <div>
            <p><strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
            <p><strong>Admin:</strong> {admin ? 'Authenticated' : 'Not authenticated'}</p>
          </div>
        </div>

        {user && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800 mb-1">User Details</h3>
            <pre className="text-sm whitespace-pre-wrap bg-white p-2 rounded">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {admin && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-800 mb-1">Admin Details</h3>
            <pre className="text-sm whitespace-pre-wrap bg-white p-2 rounded">
              {JSON.stringify(admin, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <pre className="text-sm bg-white p-3 rounded overflow-auto max-h-40">
          {cookies || 'No cookies found'}
        </pre>
      </div>

      <div className="mb-8">
        <button
          onClick={testApi}
          disabled={isTestingApi}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isTestingApi ? 'Testing...' : 'Test /api/auth/me Endpoint'}
        </button>

        {apiResponse && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">API Response</h3>
            <pre className="text-sm bg-white p-3 rounded overflow-auto max-h-60">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 