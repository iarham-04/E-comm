'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Percent,
  Image as ImageIcon, Settings, BarChart3, Users, ChevronRight, UserCheck, LogOut
} from 'lucide-react';

export type UserRole = 'CUSTOMER' | 'SUPPORT' | 'MANAGER' | 'OWNER';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  minRole: UserRole;
}

const ROLE_LEVEL: Record<UserRole, number> = {
  OWNER: 4,
  MANAGER: 3,
  SUPPORT: 2,
  CUSTOMER: 1,
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, minRole: 'SUPPORT' },
  { label: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingBag, minRole: 'SUPPORT' },
  { label: 'Products', href: '/admin/products', icon: Package, minRole: 'MANAGER' },
  { label: 'Bulk Inventory', href: '/admin/inventory', icon: Package, minRole: 'MANAGER' },
  { label: 'Categories', href: '/admin/categories', icon: Tag, minRole: 'MANAGER' },
  { label: 'Discounts & Sales', href: '/admin/discounts', icon: Percent, minRole: 'MANAGER' },
  { label: 'Homepage Banners', href: '/admin/banners', icon: ImageIcon, minRole: 'MANAGER' },
  { label: 'Customer Notes', href: '/admin/customers', icon: UserCheck, minRole: 'OWNER' },
  { label: 'Store Settings', href: '/admin/settings', icon: Settings, minRole: 'OWNER' },
  { label: 'Analytics Reports', href: '/admin/reports', icon: BarChart3, minRole: 'OWNER' },
  { label: 'User Roles', href: '/admin/users', icon: Users, minRole: 'OWNER' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>('OWNER');
  const [adminName, setAdminName] = useState<string>('Store Administrator');
  const [userEmail, setUserEmail] = useState<string>('owner@corazontouch.com');
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setCheckedAuth(true);
      return;
    }

    try {
      const sessionStr = localStorage.getItem('corazon_admin_session');
      if (!sessionStr) {
        router.push('/admin/login');
        return;
      }

      const session = JSON.parse(sessionStr);
      if (session?.role) {
        setUserRole(session.role as UserRole);
        if (session.name) setAdminName(session.name);
        if (session.email) setUserEmail(session.email);
      }
      setCheckedAuth(true);
    } catch {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('corazon_admin_session');
    } catch {}
    router.push('/admin/login');
  };

  // If on login page, render login page directly without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!checkedAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Verifying admin authorization...
      </div>
    );
  }

  const userLevel = ROLE_LEVEL[userRole] || 4;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              🛡️
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight">Corazonetouch</h1>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full inline-block border border-amber-500/20">
                {userRole} PANEL
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const hasAccess = userLevel >= ROLE_LEVEL[item.minRole];
              const isActive = pathname === item.href;

              if (!hasAccess) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400">
              {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-slate-500 uppercase">{userRole} ACCESS</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock / Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
