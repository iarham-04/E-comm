'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to standard Clerk authentication flow
    router.replace('/sign-in?redirect_url=/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        Redirecting to secure sign-in...
      </p>
    </div>
  );
}
