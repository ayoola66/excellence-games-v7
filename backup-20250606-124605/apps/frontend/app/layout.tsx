import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

// Dynamically import client-only Toaster wrapper
const ClientToaster = dynamic(
  () => import('@/components/ClientToaster'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Elite Games Trivia Platform',
  description: 'Interactive trivia games with premium features and admin management',
  keywords: 'trivia, games, quiz, premium, education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body className={`${inter.className} min-h-screen flex flex-col`}> 
        <AuthProvider>
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="w-full py-6 bg-blue-900 text-white text-center text-sm shadow-inner">
            <span className="font-semibold tracking-wide">Elite Games</span> &copy; {new Date().getFullYear()} &middot; Made with pride in the United Kingdom 🇬🇧
          </footer>
          <ClientToaster
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}