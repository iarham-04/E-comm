'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';

export default function AdminQuickAccess() {
  const pathname = usePathname();

  // Hide the floating button if already in the admin portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <Link
        href="/admin"
        className="flex items-center space-x-2.5 bg-slate-950/90 hover:bg-slate-900 text-slate-100 px-3.5 py-2.5 rounded-2xl border border-amber-500/40 hover:border-amber-400 shadow-2xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 group"
        title="Quick Access Admin Dashboard"
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Shield className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950 animate-pulse" />
        </div>
        <div className="text-left pr-1">
          <p className="text-[11px] font-black text-amber-400 group-hover:text-amber-300 leading-none">
            Admin Portal
          </p>
          <p className="text-[9px] font-semibold text-slate-400 leading-tight mt-0.5">
            Store Controls
          </p>
        </div>
      </Link>
    </div>
  );
}
