'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Percent,
  Image as ImageIcon, Settings, BarChart3, Users, ChevronRight,
  UserCheck, LogOut, Menu, X, Shield, ExternalLink
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
  const [adminName, setAdminName] = useState<string>('AZRA');
  const [userEmail, setUserEmail] = useState<string>('azra@corazontouch.com');
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
        Verifying admin authorization...
      </div>
    );
  }

  const userLevel = ROLE_LEVEL[userRole] || 4;

  const NavContent = () => (
    <div className="flex flex-col justify-between h-full bg-white text-slate-800">
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              🛡️
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 tracking-tight">Corazonetouch</h1>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full inline-block border border-amber-200">
                {userRole} PANEL
              </span>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
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
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0">
              {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">{userRole} ACCESS</p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="p-1.5 text-slate-500 hover:text-amber-600 transition-colors"
            title="View Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock / Exit Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col lg:flex-row font-body">
      {/* Mobile Top Navigation Header (<lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900"
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🛡️</span>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Admin Portal</p>
              <p className="text-[10px] text-amber-700 font-bold">{userRole} Panel</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[11px] font-bold text-amber-800">
            {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay (<lg) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Desktop Permanent Sidebar (>=lg) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0 sticky top-0 h-screen shadow-xs">
        <NavContent />
      </aside>

      {/* Main Responsive Content Area */}
      <main className="flex-1 bg-slate-100/70 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
