import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  Cog6ToothIcon,
  MusicalNoteIcon,
  CreditCardIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface SettingsModalProps {
  open: boolean
  initialTab: 'settings' | 'music' | 'billing'
  onClose: () => void
}

const tabs = [
  { id: 'settings', label: 'Display', Icon: Cog6ToothIcon },
  { id: 'music', label: 'Music', Icon: MusicalNoteIcon },
  { id: 'billing', label: 'Billing', Icon: CreditCardIcon },
] as const

export default function SettingsModal({ open, initialTab, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<typeof initialTab>(initialTab)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-4 mb-6">
                  {tabs.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                        activeTab === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                  <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Display Settings</h3>
                    <div className="flex items-center gap-3">
                      <span>Contrast:</span>
                      <button className="px-3 py-1 bg-gray-100 rounded-lg">Low</button>
                      <button className="px-3 py-1 bg-gray-200 rounded-lg">Medium</button>
                      <button className="px-3 py-1 bg-gray-300 rounded-lg">High</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Text Size:</span>
                      <button className="px-3 py-1 bg-gray-100 rounded-lg text-sm">A</button>
                      <button className="px-3 py-1 bg-gray-200 rounded-lg text-base">A</button>
                      <button className="px-3 py-1 bg-gray-300 rounded-lg text-lg">A</button>
                    </div>
                  </div>
                )}

                {activeTab === 'music' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Music Preferences</h3>
                    <p className="text-sm text-gray-600">Coming soon – upload your own background track or adjust in-game volume.</p>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Billing (Stripe)</h3>
                    <p className="text-sm text-gray-600">Premium subscriptions are managed through Stripe. Click the button below to open your customer portal.</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Open Stripe Portal</button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 