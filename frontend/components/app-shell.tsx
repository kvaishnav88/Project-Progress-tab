"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Bot,
  Brain,
  LayoutGrid,
  Menu,
  Settings,
  Sheet,
  UserCircle2,
  Waves,
  X,
} from 'lucide-react';
import { SiteHeader } from '@/components/header/site-header';
import {
  staggerContainer,
  fadeInUp,
  slideInLeft,
  drawerVariants,
  overlayVariants,
  pageTransition,
} from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/analytics', label: 'Analytics', icon: Activity },
  { href: '/wizard', label: 'Wizard', icon: Brain },
  { href: '/profile', label: 'Profile', icon: UserCircle2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/about', label: 'About', icon: Sheet },
];

/* ------------------------------------------------------------------ */
/*  Nav link component                                                 */
/* ------------------------------------------------------------------ */

function NavLink({
  item,
  active,
  onClick,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
        active
          ? 'text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {/* Animated active indicator */}
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-2xl bg-brand-600/20"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10">
        <Icon size={16} />
      </span>
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  AppShell component                                                 */
/* ------------------------------------------------------------------ */

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-6 lg:px-6 lg:py-6">

        {/* ============================================================ */}
        {/*  Desktop sidebar (hidden on mobile)                          */}
        {/* ============================================================ */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft backdrop-blur lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-3rem)]"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
              <Waves size={18} />
            </div>
            <div>
              <p className="font-semibold text-white">AuraGen</p>
              <p className="text-sm text-slate-400">Adaptive UI</p>
            </div>
          </Link>

          {/* Nav items with stagger */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-6 space-y-1"
          >
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <motion.div key={item.href} variants={fadeInUp}>
                  <NavLink item={item} active={active} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* AI overlay status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2 text-brand-100">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-medium text-white">AI overlay</p>
                <p className="text-sm text-slate-400">Live guidance is on</p>
              </div>
            </div>
          </motion.div>
        </motion.aside>

        {/* ============================================================ */}
        {/*  Mobile drawer overlay                                       */}
        {/* ============================================================ */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setDrawerOpen(false)}
              />

              {/* Drawer panel */}
              <motion.aside
                variants={drawerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col rounded-r-3xl border-r border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-md lg:hidden"
              >
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3" onClick={() => setDrawerOpen(false)}>
                    <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
                      <Waves size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">AuraGen</p>
                      <p className="text-sm text-slate-400">Adaptive UI</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white"
                    aria-label="Close menu"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-6 flex-1 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <NavLink
                        key={item.href}
                        item={item}
                        active={active}
                        onClick={() => setDrawerOpen(false)}
                      />
                    );
                  })}
                </div>

                <div className="mt-4 rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4">
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
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/*  Main content                                                */}
        {/* ============================================================ */}
        <main className="min-w-0 flex-1 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur lg:p-6">
          <SiteHeader onMenuClick={() => setDrawerOpen(true)} />
          <div className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
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
