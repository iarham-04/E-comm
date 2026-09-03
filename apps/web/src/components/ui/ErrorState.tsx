'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorStateProps {
  code?: string | number;
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  code = 'Error',
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again or contact support if the issue persists.',
  actionLabel = 'Try Again',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`text-center py-16 px-4 bg-red-50/50 rounded-3xl border border-red-200 max-w-md mx-auto space-y-4 ${className}`}>
      <div className="inline-flex p-4 rounded-full bg-red-100 text-red-600">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block">{code}</span>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-1">{title}</h3>
      </div>
      <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">{description}</p>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center font-bold text-xs bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};
