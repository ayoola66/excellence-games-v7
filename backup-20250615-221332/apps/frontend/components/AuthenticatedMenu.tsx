import { Bars3Icon, XMarkIcon, HomeIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, MusicalNoteIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import SettingsModal from '@/components/SettingsModal'

export default function AuthenticatedMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [modalTab, setModalTab] = useState<null | 'settings' | 'music' | 'billing'>(null)

  // Show nothing if user is not authenticated
  if (!user) return null

  const navItems: Array<{ href: string; label: string; Icon: any; modal?: 'settings' | 'music' | 'billing' }> = [
    { href: '/user/dashboard', label: 'Dashboard', Icon: HomeIcon },
    { href: '/profile',        label: 'Profile',   Icon: UserIcon },
    { href: '#settings',       label: 'Settings',  Icon: Cog6ToothIcon, modal: 'settings' },
    { href: '#music',          label: 'Music',     Icon: MusicalNoteIcon, modal: 'music' },
    { href: '#billing',        label: 'Billing',   Icon: CreditCardIcon,  modal: 'billing' },
  ] as const

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-all duration-300 flex flex-col ${
        open ? 'w-56' : 'w-16'
      }`}
    >
      {/* Burger / close button */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
          className="focus:outline-none"
        >
          {open ? (
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          )}
        </button>
        {open && <span className="font-bold text-gray-700">Menu</span>}
      </div>

      {/* Links */}
      <nav className="mt-4 flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          item.modal ? (
            <button
              key={item.href}
              onClick={() => { setModalTab(item.modal as any); setOpen(false) }}
              title={item.label}
              className="flex items-center gap-3 py-2 px-4 w-full text-left rounded hover:bg-gray-100 text-gray-700"
            >
              <item.Icon className="w-6 h-6" />
              {open && <span>{item.label}</span>}
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-100 text-gray-700"
            >
              <item.Icon className="w-6 h-6" />
              {open && <span>{item.label}</span>}
            </Link>
          )
        ))}

        {/* Logout */}
        <button
          onClick={() => {
            logout()
            router.push('/login')
          }}
          className="flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-100 text-gray-700 mt-auto mb-4"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
          {open && <span>Logout</span>}
        </button>
      </nav>

      {/* Floating burger when menu collapsed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3 left-3 z-30 bg-white shadow rounded-full p-2 hover:bg-gray-100 group"
          title="Open menu"
        >
          <Bars3Icon className="w-6 h-6 text-gray-700" />
          <span className="absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">Menu</span>
        </button>
      )}

      {/* Settings modal */}
      {modalTab && (
        <SettingsModal open={!!modalTab} initialTab={modalTab} onClose={() => setModalTab(null)} />
      )}
    </aside>
  )
} 