'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyRates {
  symbol: string;
  rate: number;
}

const RATES: Record<CurrencyCode, CurrencyRates> = {
  INR: { symbol: '₹', rate: 1.0 },
  USD: { symbol: '$', rate: 0.012 },
  EUR: { symbol: '€', rate: 0.011 },
  GBP: { symbol: '£', rate: 0.0094 },
};

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amountInINR: number) => string;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),
      formatPrice: (amountInINR) => {
        const current = get().currency;
        const info = RATES[current] || RATES.INR;
        const converted = amountInINR * info.rate;

        if (current === 'INR') {
          return `${info.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
        }
        return `${info.symbol}${converted.toFixed(2)}`;
      },
    }),
    {
      name: 'storefront_currency_storage',
    },
  ),
);
