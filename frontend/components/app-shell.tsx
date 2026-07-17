"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Bot,
  Brain,
  LayoutGrid,
  Settings,
  Sheet,
  UserCircle2,
  Waves,
} from 'lucide-react';
import { SiteHeader } from '@/components/header/site-header';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/analytics', label: 'Analytics', icon: Activity },
  { href: '/wizard', label: 'Wizard', icon: Brain },
  { href: '/profile', label: 'Profile', icon: UserCircle2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/about', label: 'About', icon: Sheet },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="w-full rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft backdrop-blur lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:p-6">
          <div className="flex items-center justify-between lg:block">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
                <Waves size={18} />
              </div>
              <div>
                <p className="font-semibold text-white">AuraGen</p>
                <p className="text-sm text-slate-400">Adaptive UI</p>
              </div>
            </Link>
            <Link href="/" className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white lg:hidden">
              <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                    active ? 'bg-brand-600/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2 text-brand-100">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-medium text-white">AI overlay</p>
                <p className="text-sm text-slate-400">Live guidance is on</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur lg:p-6">
          <SiteHeader />
          <div className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
