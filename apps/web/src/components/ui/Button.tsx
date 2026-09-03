'use client';

import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      href,
      children,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    // 6-State Interactive Element Styling (Default, Hover, Active, Focus, Disabled, Loading)
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

    // DLS Color Language Ratios: Primary = Black/Obsidian, Secondary = Outline/Neutral
    const variants = {
      primary:
        'bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-md hover:cursor-pointer active:bg-slate-950 active:scale-[0.99]',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-sm active:bg-slate-300 active:scale-[0.99]',
      outline:
        'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99]',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.99]',
      danger:
        'bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:shadow-md active:bg-rose-800 active:scale-[0.99]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-2 space-x-1.5 min-h-[36px]',
      md: 'text-xs px-5 py-3 space-x-2 min-h-[44px]',
      lg: 'text-sm px-7 py-4 space-x-2.5 min-h-[52px]',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`.trim();

    // Loading State: Spinner replaces text while maintaining button dimensions to prevent layout shifts
    const content = (
      <>
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="opacity-0 w-0 h-0 overflow-hidden" aria-hidden="true">{children}</span>
          </div>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={combinedClassName}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combinedClassName} disabled={disabled || loading} {...props}>
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';
