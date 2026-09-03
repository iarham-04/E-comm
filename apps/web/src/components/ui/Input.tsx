'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, fullWidth = true, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-900 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full text-xs px-3.5 py-2.5 bg-white border rounded-xl transition-all duration-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forge-gold disabled:opacity-50 disabled:bg-slate-100 ${
              icon ? 'pl-9' : ''
            } ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'} ${className}`.trim()}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, className = '', id, disabled, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-bold text-slate-900 tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={`w-full text-xs p-3.5 bg-white border rounded-xl transition-all duration-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forge-gold disabled:opacity-50 disabled:bg-slate-100 ${
            error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'
          } ${className}`.trim()}
          {...props}
        />
        {error && <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
