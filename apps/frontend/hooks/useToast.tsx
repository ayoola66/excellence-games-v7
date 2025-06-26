"use client"

import React, { useState, useCallback, createContext, useContext } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  title: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(({ title, message, type }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, title, message, type }
    
    setToasts(prev => [...prev, toast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                toast.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
                toast.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
                toast.type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' :
                'bg-blue-100 border border-blue-400 text-blue-700'
              }`}
            >
              <div className="font-semibold">{toast.title}</div>
              <div className="text-sm">{toast.message}</div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 