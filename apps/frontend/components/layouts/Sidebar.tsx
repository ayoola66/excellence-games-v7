'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ASSETS, ROUTES } from '@/lib/constants';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface MenuItemProps {
  icon: string;
  label: string;
  href: string;
  isActive?: boolean;
}

const MenuItem = ({ icon, label, href, isActive }: MenuItemProps) => {
  return (
    <Link 
      href={href}
      className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <div className="w-5 h-5 mr-3">
        <Image src={icon} alt={label} width={20} height={20} />
      </div>
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { icon: ASSETS.ICONS.DASHBOARD, label: 'Dashboard', href: ROUTES.DASHBOARD },
    { icon: ASSETS.ICONS.GAMES, label: 'My Games', href: ROUTES.GAMES },
    { icon: ASSETS.ICONS.PROFILE, label: 'Profile', href: ROUTES.PROFILE },
    { icon: ASSETS.ICONS.SETTINGS, label: 'Settings', href: ROUTES.SETTINGS },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-gray-200">
          <Link href={ROUTES.HOME} className="flex items-center">
            <Image 
              src={ASSETS.IMAGES.LOGO} 
              alt="Logo" 
              width={120} 
              height={40}
              className="object-contain w-auto h-auto" 
              priority
            />
          </Link>
        </div>
        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <MenuItem 
              key={item.href} 
              {...item} 
              isActive={pathname === item.href}
            />
          ))}
        </nav>
      </aside>
    </>
  );
} 