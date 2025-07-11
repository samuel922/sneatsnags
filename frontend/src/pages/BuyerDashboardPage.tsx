import { Container, Box } from '@mui/material';
import { BuyerDashboard } from '../components/buyer/BuyerDashboard';

export const BuyerDashboardPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'transparent'
      }}>
        <BuyerDashboard />
      </Box>
    </Container>
  );
};