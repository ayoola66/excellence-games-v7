'use client'

import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export interface CustomToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export default function CustomToast({
  id,
  type,
  title,
  message,
  onClose
}: CustomToastProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        }
      case 'error':
        return {
          icon: XCircleIcon,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        }
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        }
      case 'info':
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        }
      default:
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        }
    }
  }

  const styles = getTypeStyles()
  const IconComponent = styles.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`max-w-sm w-full ${styles.bgColor} shadow-lg rounded-lg pointer-events-auto ring-1 ${styles.borderColor} overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${styles.titleColor}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${styles.messageColor}`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`rounded-md inline-flex ${styles.bgColor} ${styles.titleColor} hover:${styles.messageColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        className={`h-1 ${type === 'success' ? 'bg-green-400' : 
                          type === 'error' ? 'bg-red-400' : 
                          type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'}`}
      />
    </motion.div>
  )
}

// Custom toast functions for better UX
export const showToast = {
  success: (title: string, message?: string) => ({
    type: 'success' as const,
    title,
    message,
    duration: 4000
  }),
  
  error: (title: string, message?: string) => ({
    type: 'error' as const,
    title,
    message,
    duration: 6000
  }),
  
  warning: (title: string, message?: string) => ({
    type: 'warning' as const,
    title,
    message,
    duration: 5000
  }),
  
  info: (title: string, message?: string) => ({
    type: 'info' as const,
    title,
    message,
    duration: 4000
  })
} 