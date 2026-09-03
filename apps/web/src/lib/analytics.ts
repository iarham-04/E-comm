'use client';

export type AnalyticsEventType =
  | 'homepage_view'
  | 'search_usage'
  | 'product_view'
  | 'image_zoom'
  | 'wishlist_add'
  | 'add_to_cart'
  | 'checkout_start'
  | 'payment_success'
  | 'shipping_progress'
  | 'order_delivered'
  | 'review_submitted'
  | 'newsletter_signup';

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  payload?: Record<string, any>;
  timestamp?: string;
}

export function trackEvent(event: AnalyticsEventType, payload?: Record<string, any>) {
  const data: AnalyticsEvent = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    console.log(`[Analytics Telemetry] 📊 ${event}`, payload || {});

    // Asynchronously dispatch telemetry event to NestJS API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/admin/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Silent catch for offline or telemetry fallback
    });
  }
}
