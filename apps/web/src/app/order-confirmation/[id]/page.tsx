'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <Card variant="elevated" padding="lg" className="space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <Badge variant="success" size="md">Order Placed Successfully</Badge>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight mt-2">
            Thank You for Your Order!
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Your order reference is <span className="font-mono font-bold text-slate-900">#{params.id}</span>. We&apos;ve sent a confirmation message to your email.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Estimated Delivery</span>
            <span className="font-bold text-slate-900">3-5 Business Days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Shipping Method</span>
            <span className="font-bold text-slate-900">Worldwide Express Shipping</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/track-order" variant="secondary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
            Track Order Status
          </Button>
          <Button href="/products" variant="outline">
            Continue Shopping
          </Button>
        </div>
      </Card>
    </div>
  );
}
