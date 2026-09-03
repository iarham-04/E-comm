'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Sparkles, KeyRound } from 'lucide-react';

export default function AdminQuickAccess() {
  const pathname = usePathname();

  // Hide the floating button if already inside the admin section
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <Link
        href="/admin/login"
        className="flex items-center space-x-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-850 text-white pl-3.5 pr-5 py-3 rounded-full border-2 border-amber-400/80 hover:border-amber-300 shadow-2xl shadow-amber-500/20 backdrop-blur-xl transition-all transform hover:scale-105 active:scale-95 group"
        title="Open Admin Login & Control Panel"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shadow-md">
          <Shield className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950" />
          </span>
        </div>
        <div className="text-left">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-black tracking-wide text-amber-400 group-hover:text-amber-300">
              Admin Portal
            </span>
            <span className="text-[10px]">👑</span>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 leading-none mt-0.5">
            AZRA Access
          </p>
        </div>
      </Link>
    </div>
  );
}
