import React from 'react';
import { TextField, InputAdornment, FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { TextFieldProps } from '@mui/material/TextField';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'default' | 'glass' | 'floating';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
}

const StyledTextField = styled(TextField)<{ customvariant: string }>(({ theme, customvariant }) => {
  const variants = {
    default: {
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
          borderColor: '#e2e8f0',
          borderWidth: '1px',
          transition: 'all 0.2s ease-in-out',
        },
        '&:hover fieldset': {
          borderColor: '#2563eb',
          boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.1)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#2563eb',
          borderWidth: '2px',
          boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
        },
        '&.Mui-error fieldset': {
          borderColor: '#ef4444',
          '&:hover': {
            borderColor: '#ef4444',
          },
        },
        '&.Mui-error.Mui-focused fieldset': {
          borderColor: '#ef4444',
          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
        },
      },
      '& .MuiInputLabel-root': {
        color: '#64748b',
        fontWeight: 500,
        fontSize: '0.875rem',
        '&.Mui-focused': {
          color: '#2563eb',
          fontWeight: 600,
        },
        '&.Mui-error': {
          color: '#ef4444',
        },
      },
    },
    glass: {
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.2)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#2563eb',
          borderWidth: '2px',
          boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
        },
      },
      '& .MuiInputLabel-root': {
        color: '#64748b',
        fontWeight: 500,
        '&.Mui-focused': {
          color: '#2563eb',
          fontWeight: 600,
        },
      },
    },
    floating: {
      '& .MuiInput-root': {
        backgroundColor: 'transparent',
        '&:before': {
          borderBottom: '2px solid #e2e8f0',
          transition: 'all 0.2s ease-in-out',
        },
        '&:hover:before': {
          borderBottom: '2px solid #2563eb',
        },
        '&:after': {
          borderBottom: '2px solid #2563eb',
        },
      },
      '& .MuiInputLabel-root': {
        color: '#64748b',
        fontWeight: 500,
        '&.Mui-focused': {
          color: '#2563eb',
          fontWeight: 600,
        },
      },
    },
  };

  return {
    ...variants[customvariant as keyof typeof variants],
    '& .MuiOutlinedInput-input': {
      padding: '14px 16px',
      fontSize: '0.875rem',
      fontFamily: 'inherit',
      lineHeight: 1.5,
    },
    '& .MuiInput-input': {
      padding: '14px 0',
      fontSize: '0.875rem',
      fontFamily: 'inherit',
      lineHeight: 1.5,
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.75rem',
      marginTop: '6px',
      marginLeft: '4px',
      lineHeight: 1.4,
      '&.Mui-error': {
        color: '#ef4444',
        fontWeight: 500,
      },
    },
  };
});

const Input = React.forwardRef<HTMLDivElement, InputProps>(
  ({ 
    variant = 'default',
    icon,
    iconPosition = 'left',
    helperText,
    error,
    sx,
    InputProps,
    ...props 
  }, ref) => {
    const startAdornment = icon && iconPosition === 'left' ? (
      <InputAdornment position="start">
        {icon}
      </InputAdornment>
    ) : undefined;

    const endAdornment = icon && iconPosition === 'right' ? (
      <InputAdornment position="end">
        {icon}
      </InputAdornment>
    ) : undefined;

    return (
      <StyledTextField
        customvariant={variant}
        ref={ref}
        variant={variant === 'floating' ? 'standard' : 'outlined'}
        error={error}
        helperText={helperText}
        InputProps={{
          startAdornment,
          endAdornment,
          ...InputProps,
        }}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            minHeight: '48px',
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
          },
          ...sx,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };