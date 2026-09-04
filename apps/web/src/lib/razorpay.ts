/**
 * Dynamically loads the Razorpay checkout.js script.
 * Safe to call multiple times — won't duplicate the script tag.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  key: string;
  amount: number;       // in paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;     // Razorpay order ID from backend
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Opens the Razorpay payment popup.
 * Returns a promise that resolves with payment details on success,
 * or rejects if the user dismisses the popup.
 */
export function openRazorpayCheckout(options: RazorpayOptions): Promise<RazorpaySuccessResponse> {
  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      ...options,
      handler: (response: RazorpaySuccessResponse) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment was cancelled by user.'));
        },
        ...options.modal,
      },
    });
    rzp.open();
  });
}
