'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Loader2, Settings, Mail, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface StoreSettingsData {
  flatShippingFee: number;
  freeShippingThreshold?: number;
  taxPercent: number;
  razorpayEnabled: boolean;
  codEnabled: boolean;
}

interface EmailTemplateData {
  id: string;
  key: string;
  subject: string;
  bodyHtml: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsData>({
    flatShippingFee: 0,
    freeShippingThreshold: 1999,
    taxPercent: 18,
    razorpayEnabled: true,
    codEnabled: true,
  });
  const [templates, setTemplates] = useState<EmailTemplateData[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'email'>('settings');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      const [resSet, resTpl] = await Promise.all([
        fetch(`${API_URL}/admin/settings`),
        fetch(`${API_URL}/admin/email-templates`),
      ]);
      if (resSet.ok) setSettings(await resSet.json());
      if (resTpl.ok) setTemplates(await resTpl.json());
    } catch {
      setMessage({ type: 'error', text: 'Failed to load store settings.' });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Store settings updated successfully.' });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTemplate = async (id: string, subject: string, bodyHtml: string) => {
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/email-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyHtml }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Email template updated.' });
        fetchSettings();
      }
    } catch {
      setMessage({ type: 'error', text: 'Template update failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Admin Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight mt-1">
            Store Settings &amp; Resend Email Templates
          </h1>
          <p className="text-xs text-slate-400">Configure global shipping fees, tax rates, payment gateways, and transactional email copy.</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Store Settings
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'email' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Email Templates
          </button>
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

      {activeTab === 'settings' ? (
        <form onSubmit={handleSaveSettings} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl text-xs">
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Shipping &amp; Tax Configuration</h2>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Flat Shipping Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.flatShippingFee}
                onChange={(e) => setSettings({ ...settings, flatShippingFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
              <p className="text-[10px] text-slate-500 mt-1">Standard shipping fee applied when order subtotal is below threshold.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.freeShippingThreshold ?? ''}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
              <p className="text-[10px] text-slate-500 mt-1">Orders equal or above this value qualify for free express shipping.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Tax / GST Percentage (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.taxPercent}
                onChange={(e) => setSettings({ ...settings, taxPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Payment Method Enablement</h2>

            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white block">Razorpay Online Gateway</span>
                <span className="text-[10px] text-slate-400">Cards, Netbanking, UPI &amp; Wallets</span>
              </div>
              <input
                type="checkbox"
                checked={settings.razorpayEnabled}
                onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white block">Cash on Delivery (COD)</span>
                <span className="text-[10px] text-slate-400">Allow customers to pay upon delivery</span>
              </div>
              <input
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start space-x-3 text-slate-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Available placeholder variables for email templates: <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono">&#123;&#123;customerName&#125;&#125;</code>, <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono">&#123;&#123;orderNumber&#125;&#125;</code>, <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono">&#123;&#123;total&#125;&#125;</code>, <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono">&#123;&#123;carrier&#125;&#125;</code>, <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono">&#123;&#123;trackingNumber&#125;&#125;</code>.
            </p>
          </div>

          <div className="space-y-6">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{tpl.key.toUpperCase()}</h3>
                    <p className="text-[10px] text-slate-500">Updated: {new Date(tpl.updatedAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleUpdateTemplate(tpl.id, tpl.subject, tpl.bodyHtml)}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2 rounded-xl font-bold transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template</span>
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={tpl.subject}
                    onChange={(e) => {
                      const updated = templates.map((t) => (t.id === tpl.id ? { ...t, subject: e.target.value } : t));
                      setTemplates(updated);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">HTML Body</label>
                  <textarea
                    rows={5}
                    value={tpl.bodyHtml}
                    onChange={(e) => {
                      const updated = templates.map((t) => (t.id === tpl.id ? { ...t, bodyHtml: e.target.value } : t));
                      setTemplates(updated);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
