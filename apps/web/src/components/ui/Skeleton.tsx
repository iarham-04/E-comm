'use client';

import React from 'react';

export interface SkeletonProps {
  variant?: 'line' | 'circle' | 'card' | 'product';
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'line',
  width,
  height,
  className = '',
}) => {
  const baseStyles = 'animate-pulse bg-slate-200 rounded-xl';

  if (variant === 'circle') {
    return (
      <div
        className={`${baseStyles} rounded-full ${className}`}
        style={{ width: width || '40px', height: height || '40px' }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-white border border-slate-200 rounded-2xl space-y-4 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (variant === 'product') {
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse ${className}`}>
        <div className="aspect-square bg-slate-200" />
        <div className="p-5 space-y-3">
          <div className="h-3 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-9 bg-slate-200 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseStyles} ${className}`}
      style={{ width: width || '100%', height: height || '16px' }}
    />
  );
};
