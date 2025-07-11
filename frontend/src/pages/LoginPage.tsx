import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoginForm } from '../components/auth/LoginForm';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e0f2fe 0%, #f3e5f5 50%, #fce4ec 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
}));

const BackgroundOrb = styled(Box)<{ delay?: string }>(({ theme, delay }) => ({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(60px)',
  opacity: 0.3,
  animation: 'float 6s ease-in-out infinite',
  animationDelay: delay || '0s',
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-20px)',
    },
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 10,
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
}));

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledContainer role="main" aria-label="Login page">
      {/* Background Orbs */}
      <BackgroundOrb
        sx={{
          top: '25%',
          left: '25%',
          width: { xs: '200px', sm: '300px', md: '400px' },
          height: { xs: '200px', sm: '300px', md: '400px' },
          background: 'linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)',
        }}
      />
      <BackgroundOrb
        delay="2s"
        sx={{
          bottom: '25%',
          right: '25%',
          width: { xs: '200px', sm: '300px', md: '400px' },
          height: { xs: '200px', sm: '300px', md: '400px' },
          background: 'linear-gradient(45deg, #E91E63 30%, #F44336 90%)',
        }}
      />
      
      <ContentWrapper>
        <LoginForm />
      </ContentWrapper>
    </StyledContainer>
  );
};