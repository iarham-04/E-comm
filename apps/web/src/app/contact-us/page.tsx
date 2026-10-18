'use client';

import { useState } from 'react';
import { Mail, Gift, Send, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { SITE } from '@/lib/site';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSendError(false);

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSendError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Customer Support</span>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">Get in Touch with Our Team</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Questions about an order, delivery, product freshness or bulk gift hampers? Send us a message and we&apos;ll get back to you, usually within one business day.
            </p>
          </div>

          <div className="space-y-4 text-xs font-medium text-slate-700">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <Mail className="w-5 h-5 text-amber-600" />
              <span>{SITE.supportEmail}</span>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <Gift className="w-5 h-5 text-amber-600" />
              <span>Bulk &amp; corporate gift hampers — mention quantity and delivery date in your message.</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">Message Sent Successfully!</h2>
              <p className="text-xs text-slate-500">Thank you for reaching out. We usually reply within one business day.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">Send Us a Message</h2>
              {sendError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  Sorry, your message could not be sent. Please try again or email {SITE.supportEmail}.
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alexander Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
