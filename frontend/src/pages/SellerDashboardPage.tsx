import { Container, Box } from '@mui/material';
import { SellerDashboard } from '../components/seller/SellerDashboard';

export const SellerDashboardPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'transparent'
      }}>
        <SellerDashboard />
      </Box>
    </Container>
  );
};