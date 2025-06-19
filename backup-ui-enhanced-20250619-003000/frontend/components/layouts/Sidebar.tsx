'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ASSETS, ROUTES } from '@/lib/constants';

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
      className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-gray-800 text-white' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
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
  
  const menuItems = [
    { icon: ASSETS.ICONS.DASHBOARD, label: 'Dashboard', href: ROUTES.DASHBOARD },
    { icon: ASSETS.ICONS.GAMES, label: 'My Games', href: ROUTES.GAMES },
    { icon: ASSETS.ICONS.PROFILE, label: 'Profile', href: ROUTES.PROFILE },
    { icon: ASSETS.ICONS.SETTINGS, label: 'Settings', href: ROUTES.SETTINGS },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
      <div className="p-6">
        <Link href={ROUTES.HOME}>
          <Image src={ASSETS.IMAGES.LOGO} alt="Logo" width={120} height={40} />
        </Link>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <MenuItem 
            key={item.href} 
            {...item} 
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
} 