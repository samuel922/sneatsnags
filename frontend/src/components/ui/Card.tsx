import React from 'react';
import { Card as MuiCard, CardContent as MuiCardContent, CardActions as MuiCardActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { CardProps as MuiCardProps } from '@mui/material/Card';

interface CardProps extends MuiCardProps {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'bordered' | 'interactive';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.ComponentProps<typeof MuiCardContent> {}
interface CardFooterProps extends React.ComponentProps<typeof MuiCardActions> {}

const StyledCard = styled(MuiCard)<{ customvariant: string; customhover: boolean; custompadding: string }>(({ theme, customvariant, customhover, custompadding }) => {
  const variants = {
    default: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    gradient: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    elevated: {
      backgroundColor: '#ffffff',
      border: 'none',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    },
    bordered: {
      backgroundColor: '#ffffff',
      border: '2px solid #e2e8f0',
      boxShadow: 'none',
    },
    interactive: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-2px)',
      },
    },
  };

  const paddings = {
    none: { 
      '& .MuiCardContent-root': { padding: 0 },
      '& .MuiCardContent-root:last-child': { paddingBottom: 0 },
    },
    sm: { 
      '& .MuiCardContent-root': { padding: '16px' },
      '& .MuiCardContent-root:last-child': { paddingBottom: '16px' },
    },
    md: { 
      '& .MuiCardContent-root': { padding: '24px' },
      '& .MuiCardContent-root:last-child': { paddingBottom: '24px' },
    },
    lg: { 
      '& .MuiCardContent-root': { padding: '32px' },
      '& .MuiCardContent-root:last-child': { paddingBottom: '32px' },
    },
    xl: { 
      '& .MuiCardContent-root': { padding: '40px' },
      '& .MuiCardContent-root:last-child': { paddingBottom: '40px' },
    },
  };

  const hoverStyles = customhover ? {
    '&:hover': {
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-2px)',
    },
  } : {};

  return {
    ...variants[customvariant as keyof typeof variants],
    ...paddings[custompadding as keyof typeof paddings],
    borderRadius: '16px',
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
    ...hoverStyles,
  };
});

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, padding = 'md', children, sx, ...props }, ref) => {
    return (
      <StyledCard
        customvariant={variant}
        customhover={hover}
        custompadding={padding}
        ref={ref}
        sx={sx}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        paddingBottom: '24px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, ...props }, ref) => (
    <MuiCardContent ref={ref} {...props}>
      {children}
    </MuiCardContent>
  )
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, ...props }, ref) => (
    <MuiCardActions 
      ref={ref} 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        paddingTop: '24px',
        paddingX: '24px',
        paddingBottom: '24px',
      }} 
      {...props}
    >
      {children}
    </MuiCardActions>
  )
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };