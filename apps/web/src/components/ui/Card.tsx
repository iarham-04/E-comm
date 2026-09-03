'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', padding = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300';

    const variants = {
      elevated: 'bg-white border border-slate-200 shadow-sm hover:shadow-md',
      outlined: 'bg-white border border-slate-200',
      flat: 'bg-slate-100/80 border border-transparent',
      dark: 'bg-obsidian border border-slate-800 text-white shadow-xl',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`.trim();

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
