'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
  loading = false
}: ConfirmDialogProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: TrashIcon,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-200'
        }
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200'
        }
      case 'info':
        return {
          icon: InformationCircleIcon,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-200'
        }
      case 'success':
        return {
          icon: CheckCircleIcon,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonBg: 'bg-green-600 hover:bg-green-700',
          borderColor: 'border-green-200'
        }
      default:
        return {
          icon: ExclamationTriangleIcon,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200'
        }
    }
  }

  const styles = getTypeStyles()
  const IconComponent = styles.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onCancel}
          />
          
          {/* Dialog */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                    <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      {title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 whitespace-pre-line">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`border-t ${styles.borderColor} bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6`}>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={`inline-flex w-full justify-center items-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${styles.buttonBg}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors sm:mt-0 sm:w-auto disabled:opacity-50"
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
} 