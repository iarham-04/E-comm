'use client';

import { useState } from 'react';
import { API_URL } from './api';

/** Newsletter signup state + submit handler shared by every subscribe form. */
export function useNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const res = await fetch(`${API_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => null);
    if (res?.ok) {
      setEmail('');
      setStatus('done');
    } else {
      setStatus('error');
    }
  };

  return { email, setEmail, status, submit };
}
