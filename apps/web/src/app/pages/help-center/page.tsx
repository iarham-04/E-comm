export default function HelpCenterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Help Center & FAQ</h1>
      <p className="text-slate-600 mb-8">Find quick answers to common questions about orders, payments, and shipping.</p>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-900">How long does shipping take?</h3>
          <p className="text-sm text-slate-600 mt-2">Standard delivery takes 3-5 business days. Express delivery arrives within 2 business days.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-900">Can I track my guest order?</h3>
          <p className="text-sm text-slate-600 mt-2">Yes, visit our Track Order page and enter your Order ID + Email used at checkout.</p>
        </div>
      </div>
    </div>
  );
}
