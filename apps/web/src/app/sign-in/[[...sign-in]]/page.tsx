import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Admin Quick Entry Banner */}
      <Link
        href="/admin/login"
        className="w-full max-w-md bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-400 p-4 rounded-2xl shadow-xl flex items-center justify-between group transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
            🛡️
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
              Store Administrator / Staff?
            </p>
            <p className="text-[11px] text-slate-400">
              Sign in via the Admin Security Portal →
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </Link>

      {/* Customer Clerk Login Box */}
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
