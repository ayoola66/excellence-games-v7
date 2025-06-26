"use client"

import { useEffect, useState } from 'react'

interface AuthState {
  cookies: string
  userToken: string
  adminToken: string
  apiResponse: any | null
  loading: boolean
  error: string | null
}

export default function DebugAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    cookies: '',
    userToken: '',
    adminToken: '',
    apiResponse: null,
    loading: false,
    error: null
  })

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie
      const userToken = cookies.split(';').find(c => c.trim().startsWith('clientUserToken='))
      const adminToken = cookies.split(';').find(c => c.trim().startsWith('clientAdminToken='))
      
      setAuthState(prev => ({
        ...prev,
        cookies,
        userToken: userToken || 'Not found',
        adminToken: adminToken || 'Not found'
      }))
    }
  }, [])

  const checkAuth = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      const data = await response.json()
      
      setAuthState(prev => ({
        ...prev,
        apiResponse: data,
        loading: false
      }))
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: String(error),
        loading: false
      }))
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Cookies</h2>
        <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
          {authState.cookies || 'No cookies found'}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Auth Tokens</h2>
        <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
          <p><strong>User Token:</strong> {authState.userToken}</p>
          <p><strong>Admin Token:</strong> {authState.adminToken}</p>
        </div>
      </div>
      
      <button 
        onClick={checkAuth}
        disabled={authState.loading}
        style={{
          background: '#4299e1',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {authState.loading ? 'Checking...' : 'Check Auth API'}
      </button>
      
      {authState.apiResponse && (
        <div style={{ marginTop: '20px' }}>
          <h2>API Response</h2>
          <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(authState.apiResponse, null, 2)}
          </pre>
        </div>
      )}
      
      {authState.error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <h2>Error</h2>
          <pre style={{ background: '#fff0f0', padding: '10px', borderRadius: '5px' }}>
            {authState.error}
          </pre>
        </div>
      )}
    </div>
  )
} 