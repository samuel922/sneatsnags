import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  animated?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    animated = true,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-blue-500 border-0',
      secondary: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 shadow-md hover:shadow-lg hover:scale-105 focus:ring-slate-500 border border-slate-200',
      outline: 'border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-600 hover:text-white hover:scale-105 focus:ring-blue-500 shadow-md hover:shadow-lg',
      ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500 hover:scale-105',
      destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-red-500 border-0',
      gradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-purple-500 border-0 btn-shine',
      glass: 'glass text-slate-900 shadow-lg hover:shadow-xl hover:scale-105 focus:ring-blue-500 border-0',
    };

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs rounded-md',
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-xl',
      xl: 'px-8 py-4 text-lg rounded-xl',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          animated && 'transform',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        )}
        {!isLoading && children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };