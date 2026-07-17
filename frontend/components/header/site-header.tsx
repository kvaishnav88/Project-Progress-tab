"use client";

import Link from 'next/link';
import { Bell, Search, Sparkles } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AuraGen workspace</p>
          <p className="text-xs text-slate-400">Adaptive frontend experience</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-400 sm:flex">
          <Search size={16} />
          <input
            className="w-28 bg-transparent outline-none placeholder:text-slate-500 sm:w-40"
            placeholder="Search"
          />
        </label>
        <button className="rounded-full border border-white/10 bg-slate-950/70 p-2 text-slate-300 transition hover:text-white">
          <Bell size={16} />
        </button>
        <Link href="/profile" className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-sm text-brand-100">
          Profile
        </Link>
      </div>
    </header>
  );
}
