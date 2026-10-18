'use client';

import { PHONE_COUNTRY_OPTIONS, splitInternationalPhone } from '@corazon/checkout-data';
import { Input } from './Input';
import { Select } from './Select';

interface PhoneInputProps {
  id: string;
  label: string;
  country: string;
  value: string;
  onCountryChange: (country: string) => void;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
}

export function PhoneInput({ id, label, country, value, onCountryChange, onChange, autoComplete, error }: PhoneInputProps) {
  const errorId = `${id}-error`;
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-slate-900 tracking-wide uppercase">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <Select
          id={`${id}-country`}
          aria-label={`${label} country calling code`}
          options={PHONE_COUNTRY_OPTIONS}
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
          className="min-h-11"
        />
        <Input
          id={id}
          type="tel"
          required
          autoComplete={autoComplete}
          placeholder="Phone number"
          value={value}
          maxLength={30}
          className="min-h-11"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            const raw = event.target.value;
            const international = splitInternationalPhone(raw);
            if (international) {
              onCountryChange(international.country);
              onChange(international.nationalNumber);
            } else {
              onChange(raw);
            }
          }}
        />
      </div>
      {error && <p id={errorId} role="alert" className="text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
