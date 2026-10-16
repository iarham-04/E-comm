'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, SignIn } from '@clerk/nextjs';
import { Shield, ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();

  const isUnauthorized = searchParams.get('error') === 'unauthorized';

  useEffect(() => {
    // If the user is already signed in and not explicitly unauthorized, send to /admin dashboard
    if (isLoaded && isSignedIn && !isUnauthorized) {
      router.replace('/admin');
    }
  }, [isLoaded, isSignedIn, isUnauthorized, router]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar with Brand and Storefront Link */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
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

      {/* Main Administrative Sign-In Content */}
      <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
        {/* Portal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3 h-3" />
            <span>Restricted Gateway</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
            Administrative Portal
          </h1>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Please authenticate using your authorized Corazonetouch staff or owner credentials to enter the operations suite.
          </p>
        </div>

        {/* Unauthorized Warning Banner */}
        {isUnauthorized && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-300">Access Restricted</p>
              <p className="text-[11px] text-rose-200/80 leading-relaxed">
                The account you signed in with does not hold staff or owner privileges. Please sign in with an authorized administrator profile.
              </p>
            </div>
          </div>
        )}

        {/* Embedded Clerk Sign In Component */}
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

      {/* Security & Audit Footer */}
      <div className="max-w-md w-full mx-auto text-center py-4 border-t border-neutral-900 space-y-1 text-neutral-500 text-[11px]">
        <div className="flex items-center justify-center space-x-2">
          <span>🔒 256-Bit SSL Encrypted Admin Channel</span>
        </div>
        <p className="text-[10px] text-neutral-600">
          All administrative operations, access logs, and inventory updates are permanently audited.
        </p>
      </div>
    </div>
  );
}
