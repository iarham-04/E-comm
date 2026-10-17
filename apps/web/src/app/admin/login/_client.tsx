'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useClerk, SignIn } from '@clerk/nextjs';
import { Shield, ShieldAlert, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { getAdminProfile } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [checkingRole, setCheckingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      setCheckingRole(true);
      getAdminProfile()
        .then((profile) => {
          if (profile && profile.role !== 'CUSTOMER') {
            router.push('/admin');
          } else {
            setRoleError(
              `Signed in as ${user?.primaryEmailAddress?.emailAddress || 'User'}. This account does not possess staff or owner privileges.`,
            );
            setCheckingRole(false);
          }
        })
        .catch(() => {
          setRoleError('Unable to verify permissions. Please contact administrator.');
          setCheckingRole(false);
        });
    } else {
      setRoleError(null);
      setCheckingRole(false);
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar with Brand & Storefront Link */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-lg shadow-amber-500/5">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="font-serif tracking-wider font-bold text-base text-white block uppercase">
              Corazonetouch
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-400/90 block">
              Staff &amp; Executive Console
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Storefront</span>
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
        {checkingRole ? (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Verifying staff permissions...
            </p>
          </div>
        ) : roleError ? (
          <div className="bg-neutral-900/90 border border-rose-500/30 rounded-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">Access Denied</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">{roleError}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => signOut()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account</span>
              </button>
              <Link
                href="/"
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs uppercase tracking-wider transition text-center"
              >
                Return to Store
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
                <Shield className="w-3 h-3" />
                <span>Restricted Gateway</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
                Administrative Portal
              </h1>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Sign in with your verified staff or executive account to access store administration.
              </p>
            </div>

            <div className="flex justify-center">
              <SignIn
                routing="path"
                path="/admin/login"
                forceRedirectUrl="/admin"
                fallbackRedirectUrl="/admin"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-neutral-900/90 border border-neutral-800 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-md',
                    headerTitle: 'text-white font-bold text-lg',
                    headerSubtitle: 'text-neutral-400 text-xs',
                    socialButtonsBlockButton:
                      'bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-200 text-xs font-semibold py-2.5 transition-all',
                    socialButtonsBlockButtonText: 'text-neutral-200 font-medium',
                    dividerLine: 'bg-neutral-800',
                    dividerText: 'text-neutral-500 text-xs uppercase',
                    formFieldLabel: 'text-neutral-300 text-xs font-medium',
                    formFieldInput:
                      'bg-neutral-950 border border-neutral-700 text-white text-xs rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all',
                    formButtonPrimary:
                      'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all',
                    footerAction: 'hidden',
                    identityPreviewText: 'text-neutral-300',
                    identityPreviewEditButton: 'text-amber-400 hover:text-amber-300',
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="max-w-md w-full mx-auto text-center py-4 border-t border-neutral-900 space-y-1 text-neutral-500 text-[11px]">
        <div className="flex items-center justify-center space-x-2">
          <span>🔒 256-Bit Encrypted Administrative Session</span>
        </div>
        <p className="text-[10px] text-neutral-600">
          Role-based access enforced by server verification and Clerk authentication.
        </p>
      </div>
    </div>
  );
}
