// This file is not needed as framer-motion includes its own types
// This is just a placeholder to ensure the directory exists 

declare module 'framer-motion' {
  import * as React from 'react'

  export interface MotionProps {
    initial?: any
    animate?: any
    exit?: any
    transition?: any
    whileHover?: any
    whileTap?: any
    whileInView?: any
    viewport?: any
    variants?: any
    style?: React.CSSProperties
    className?: string
    [key: string]: any
  }

  type Motion = {
    [K in keyof JSX.IntrinsicElements]: React.ForwardRefExoticComponent<
      MotionProps & JSX.IntrinsicElements[K]
    >
  }

  export const motion: Motion
  export const AnimatePresence: React.FC<{
    children?: React.ReactNode
    mode?: 'sync' | 'popLayout' | 'wait'
    initial?: boolean
    onExitComplete?: () => void
  }>
} 