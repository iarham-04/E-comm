'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignIn } from '@clerk/nextjs';
import {
  Shield, Lock, KeyRound, User, ArrowRight, ArrowLeft,
  AlertCircle, CheckCircle2, Loader2, Sparkles
} from 'lucide-react';
import { getLocalAdminSession, ADMIN_SESSION_KEY } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const { isLoaded, isSignedIn } = useUser();

  const [activeTab, setActiveTab] = useState<'key' | 'clerk'>('key');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If already logged in via local master session, directly forward to /admin
    const local = getLocalAdminSession();
    if (local) {
      window.location.href = '/admin';
      return;
    }

    // If signed in via Clerk, forward to /admin
    if (isLoaded && isSignedIn) {
      window.location.href = '/admin';
    }
  }, [isLoaded, isSignedIn]);

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin.trim(),
          identifier: identifier.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid security key / passcode. Access denied.');
      }

      // Server-signed token; expires after 12 hours
      localStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({ token: data.token, name: data.user?.name, expiresAt: data.expiresAt }),
      );

      setSuccess(true);

      // Perform a full location navigation to ensure complete fresh load of admin layout
      setTimeout(() => {
        window.location.href = '/admin';
      }, 200);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your admin key.');
      setLoading(false);
    }
  };

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
        {/* Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3 h-3" />
            <span>Restricted Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            Administrative Portal
          </h1>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Enter your Admin Identifier and Security Key to access the store management suite.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('key')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'key'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin Key / Passcode</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clerk')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'clerk'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clerk OAuth</span>
          </button>
        </div>

        {/* Key Login Form */}
        {activeTab === 'key' && (
          <div className="bg-neutral-900/90 border border-neutral-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-neutral-200">Owner &amp; Staff Key</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                Direct Access
              </span>
            </div>

            {error && (
              <div className="flex items-start space-x-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Security key verified! Entering Admin Dashboard...</span>
              </div>
            )}

            <form onSubmit={handleKeyLogin} className="space-y-4">
              {/* Admin Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  Admin Name / Identifier
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. AZRA or Store Owner"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Master Security Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Security Passkey / Master Key *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your security passcode"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Security Key...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Clerk Tab */}
        {activeTab === 'clerk' && (
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
        )}
      </div>

      {/* Security Footer */}
      <div className="max-w-md w-full mx-auto text-center py-4 border-t border-neutral-900 space-y-1 text-neutral-500 text-[11px]">
        <div className="flex items-center justify-center space-x-2">
          <span>🔒 256-Bit SSL Encrypted Admin Channel</span>
        </div>
        <p className="text-[10px] text-neutral-600">
          All administrative sessions, operations, and product updates are encrypted and audited.
        </p>
      </div>
    </div>
  );
}
