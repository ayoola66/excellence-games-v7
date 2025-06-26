"use client"

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [cookies, setCookies] = useState('')
  const [apiResponse, setApiResponse] = useState(null)
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setCookies(document.cookie)
    }
  }, [])
  
  const testApi = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      console.error('API Error:', error)
      setApiResponse({ error: String(error) })
    }
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug Page</h1>
      <h2>Cookies:</h2>
      <pre>{cookies || 'No cookies'}</pre>
      
      <button 
        onClick={testApi}
        style={{ 
          padding: '10px 20px', 
          background: 'blue', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Test Auth API
      </button>
      
      {apiResponse && (
        <div style={{ marginTop: '20px' }}>
          <h2>API Response:</h2>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  )
} 