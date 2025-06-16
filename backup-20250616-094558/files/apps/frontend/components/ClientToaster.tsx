'use client'

import React from 'react'
import { Toaster, ToasterProps } from 'react-hot-toast'

export default function ClientToaster(props: Omit<ToasterProps, 'position' | 'toastOptions'> & {
  position?: ToasterProps['position'],
  toastOptions?: ToasterProps['toastOptions'],
}) {
  return <Toaster {...props} />
} 