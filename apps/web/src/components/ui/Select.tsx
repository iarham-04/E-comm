'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, fullWidth = true, className = '', id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-slate-900 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full appearance-none text-xs px-3.5 py-2.5 bg-white border rounded-xl transition-all duration-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-forge-gold disabled:opacity-50 disabled:bg-slate-100 pr-9 ${
              error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'
            } ${className}`.trim()}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
        {error && <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
