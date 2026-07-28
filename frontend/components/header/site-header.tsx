"use client";

import Link from 'next/link';
import { Bell, Menu, Search, Sparkles } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Site header — top bar inside the main content area                 */
/* ------------------------------------------------------------------ */

type SiteHeaderProps = {
  onMenuClick?: () => void;
};

export function SiteHeader({ onMenuClick }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — visible only on mobile */}
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AuraGen workspace</p>
          <p className="hidden text-xs text-slate-400 sm:block">
            Adaptive frontend experience
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-400 transition focus-within:border-brand-500/50 sm:flex">
          <Search size={16} />
          <input
            className="w-28 bg-transparent outline-none placeholder:text-slate-500 sm:w-40"
            placeholder="Search"
          />
        </label>

        {/* Mobile search — icon only */}
        <button className="rounded-full border border-white/10 bg-slate-950/70 p-2 text-slate-300 transition hover:text-white sm:hidden">
          <Search size={16} />
        </button>

        <button className="relative rounded-full border border-white/10 bg-slate-950/70 p-2 text-slate-300 transition hover:text-white">
          <Bell size={16} />
          {/* Notification dot */}
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>

        <Link
          href="/profile"
          className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-sm text-brand-100 transition hover:bg-brand-500/20"
        >
          Profile
        </Link>
      </div>
    </header>
  );
}
