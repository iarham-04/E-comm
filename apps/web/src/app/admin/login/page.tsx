'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('Store Owner');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body selection:bg-amber-500 selection:text-slate-950">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-xl shadow-amber-500/5 mb-3 text-2xl relative">
            <span className="text-3xl">🛡️</span>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            Corazonetouch
          </h1>
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Admin Security Portal &amp; Control Center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Authorized Personnel Only</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              OWNER / STAFF
            </span>
          </div>

          {error && (
            <div className="flex items-start space-x-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Passcode verified! Entering Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Admin Identifier */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Admin Identifier / Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Store Owner, Inventory Manager"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Master Security Passcode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Master Security Passcode *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your master passkey"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition font-mono tracking-wider"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50"
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
          <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-800/80">
            <p>Access passcodes are issued only to verified store owners and managers.</p>
          </div>
        </div>

        {/* Back to Storefront Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Return to Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
