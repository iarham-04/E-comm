'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, KeyRound, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin.trim(),
          identifier: identifier.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid master passcode. Access denied.');
      }

      // Save authenticated admin session
      const sessionData = {
        token: data.token,
        role: data.role || 'OWNER',
        name: data.user?.name || identifier,
        email: data.user?.email || 'owner@corazontouch.com',
        timestamp: Date.now(),
      };

      localStorage.setItem('corazon_admin_session', JSON.stringify(sessionData));
      setSuccess(true);

      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your passcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-body selection:bg-neutral-900 selection:text-white">
      {/* Ambient background decorative elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-neutral-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-80 h-64 sm:h-80 bg-neutral-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md relative z-10 my-auto">
        {/* Header Branding */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-neutral-200 shadow-md mb-2 text-2xl relative">
            <span className="text-2xl sm:text-3xl">🛡️</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <Lock className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-white" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Corazonetouch
          </h1>
          <p className="text-[11px] sm:text-xs font-bold text-neutral-400 tracking-wide uppercase">
            Admin Security Portal &amp; Control Center
          </p>
        </div>

        {/* Login Card (Light Theme) */}
        <div className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg shadow-neutral-200/40 space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5 sm:pb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-neutral-600" />
              <span className="text-xs font-bold text-neutral-800">Authorized Personnel Only</span>
            </div>
            <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
              OWNER / STAFF
            </span>
          </div>

          {error && (
            <div className="flex items-start space-x-3 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 sm:p-4 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Passcode verified! Entering Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* Admin Identifier */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-600">
                Admin Identifier / Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 sm:top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter Admin Name"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 text-xs sm:text-sm bg-[#fafafa] hover:bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition min-h-[44px]"
                />
              </div>
            </div>

            {/* Master Security Passcode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-600">
                  Master Security Passcode *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-neutral-500 hover:text-neutral-800 font-bold p-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 sm:top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your master passkey"
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 text-xs sm:text-sm bg-[#fafafa] hover:bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition font-mono tracking-wider min-h-[44px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold py-3.5 sm:py-3 px-4 rounded-xl shadow-md transition-all transform active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <span>Unlock Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="pt-2 text-center text-[11px] text-neutral-400 border-t border-neutral-100">
            <p>Access passcodes are issued only to verified store owners and managers.</p>
          </div>
        </div>

        {/* Return to Storefront */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center space-x-1 py-2 px-3 rounded-lg hover:bg-neutral-100"
          >
            <span>← Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
