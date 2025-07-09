import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RegisterForm } from '../components/auth/RegisterForm';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e8f5e8 0%, #e0f2fe 50%, #f3e5f5 100%)',
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
  opacity: 0.4,
  animation: 'float 8s ease-in-out infinite',
  animationDelay: delay || '0s',
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px) translateX(0px)',
    },
    '33%': {
      transform: 'translateY(-30px) translateX(10px)',
    },
    '66%': {
      transform: 'translateY(10px) translateX(-20px)',
    },
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 10,
  width: '100%',
  maxWidth: '500px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '550px',
  },
}));

export const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledContainer>
      {/* Background Orbs */}
      <BackgroundOrb
        sx={{
          top: '16%',
          left: '33%',
          width: { xs: '160px', sm: '240px', md: '320px' },
          height: { xs: '160px', sm: '240px', md: '320px' },
          background: 'linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)',
        }}
      />
      <BackgroundOrb
        delay="3s"
        sx={{
          bottom: '16%',
          right: '33%',
          width: { xs: '160px', sm: '240px', md: '320px' },
          height: { xs: '160px', sm: '240px', md: '320px' },
          background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
        }}
      />
      <BackgroundOrb
        delay="1.5s"
        sx={{
          top: '50%',
          left: '16%',
          width: { xs: '120px', sm: '180px', md: '240px' },
          height: { xs: '120px', sm: '180px', md: '240px' },
          background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
        }}
      />
      
      <ContentWrapper>
        <RegisterForm />
      </ContentWrapper>
    </StyledContainer>
  );
};