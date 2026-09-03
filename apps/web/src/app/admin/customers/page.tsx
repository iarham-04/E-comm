'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, UserCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface CustomerData {
  id: string;
  name?: string;
  email: string;
  role: string;
  notes?: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      if (res.ok) {
        const data: CustomerData[] = await res.json();
        setCustomers(data);
        const map: Record<string, string> = {};
        data.forEach((c) => { map[c.id] = c.notes || ''; });
        setNotesMap(map);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load customers.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSaveNotes = async (customerId: string) => {
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/customers/${customerId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesMap[customerId] }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Internal customer note saved.' });
        fetchCustomers();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save notes.' });
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Customer Management &amp; Staff Notes</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> OWNER ONLY
            </span>
          </h1>
          <p className="text-xs text-slate-400">Maintain confidential internal staff notes (VIP status, preferences, support history). Never exposed to customers.</p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center space-x-2 p-4 rounded-xl text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Customer List */}
      <div className="space-y-4">
        {customers.map((c) => (
          <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">{c.name || 'Anonymous Customer'}</h3>
                <p className="text-xs font-mono text-slate-400">{c.email} · Registered {new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-amber-400">{c._count?.orders ?? 0} Orders</span>
                <button
                  onClick={() => handleSaveNotes(c.id)}
                  className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl font-bold transition-colors text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <span>Internal Staff Notes</span>
                <span className="text-[9px] text-amber-400/80 font-mono">(CONFIDENTIAL — Staff Only)</span>
              </label>
              <textarea
                rows={2}
                value={notesMap[c.id] ?? ''}
                onChange={(e) => setNotesMap({ ...notesMap, [c.id]: e.target.value })}
                placeholder="e.g. VIP collector interested in Toledo Steel swords. Prefers email updates..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
