"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GeckoLogo from './GeckoLogo';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  
  const navLinks = [
    { name: 'Profiel', href: '/profile' },
    { name: 'Contact', href: '/contact' },
    { name: 'Instellingen', href: '/settings' },
  ];

  if (isLoggedIn) {
    navLinks.push({ name: 'Dashboard', href: '/dashboard' });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex gap-5 items-center font-bold text-xl tracking-tighter">
            <GeckoLogo className="w-12 h-12" />
            <span>SHOWCASE</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-accent hover:text-accent/80' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}