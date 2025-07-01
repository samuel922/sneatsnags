import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'glass' | 'floating';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default',
    icon,
    iconPosition = 'left',
    type = 'text', 
    ...props 
  }, ref) => {
    const baseStyles = "flex h-12 w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    
    const variants = {
      default: 'border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 shadow-sm hover:shadow-md',
      glass: 'glass border-white/20 text-slate-900 placeholder:text-slate-500 focus:border-white/30 focus:ring-blue-500 shadow-lg',
      floating: 'border-0 border-b-2 border-slate-200 bg-transparent rounded-none px-0 focus:border-blue-500 focus:ring-0 focus:ring-offset-0',
    };

    const iconStyles = icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '';

    return (
      <div className="w-full space-y-2">
        {label && variant !== 'floating' && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              baseStyles,
              variants[variant],
              iconStyles,
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          
          {variant === 'floating' && label && (
            <label className={cn(
              "absolute left-0 top-1/2 transform -translate-y-1/2 text-slate-500 transition-all duration-300 pointer-events-none",
              "peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-600",
              props.value && "top-0 text-sm text-blue-600"
            )}>
              {label}
            </label>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 font-medium animate-pulse">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };