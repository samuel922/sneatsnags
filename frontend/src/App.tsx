import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { CreateOfferPage } from './pages/CreateOfferPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerOffersPage } from './pages/BuyerOffersPage';
import { TicketSearchPage } from './pages/TicketSearchPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerListingsPage } from './pages/SellerListingsPage';
import { SellerOffersPage } from './pages/SellerOffersPage';
import { BuyerTransactionsPage } from './pages/BuyerTransactionsPage';
import { SellerTransactionsPage } from './pages/SellerTransactionsPage';
import { BuyerProfile } from './components/profile/BuyerProfile';
import { UserRole } from './types/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Routes with layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/events" element={<EventsPage />} />
                    
                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Buyer routes */}
                    <Route
                      path="/buyer/dashboard"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.BUYER]}>
                          <BuyerDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/my-offers"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.BUYER]}>
                          <BuyerOffersPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/tickets/search"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.BUYER]}>
                          <TicketSearchPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/events/:eventId/offer"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.BUYER]}>
                          <CreateOfferPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/buyer/transactions"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.BUYER]}>
                          <BuyerTransactionsPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Seller routes */}
                    <Route
                      path="/seller/dashboard"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.SELLER]}>
                          <SellerDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/my-listings"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.SELLER]}>
                          <SellerListingsPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/seller/listings"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.SELLER]}>
                          <SellerListingsPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/seller/offers"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.SELLER]}>
                          <SellerOffersPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/seller/transactions"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.SELLER]}>
                          <SellerTransactionsPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Public marketplace routes */}
                    <Route
                      path="/listings"
                      element={
                        <div className="max-w-7xl mx-auto px-4 py-8">
                          <h1 className="text-2xl font-bold">Browse Tickets</h1>
                          <p className="text-gray-600 mt-2">Coming soon...</p>
                        </div>
                      }
                    />
                    
                    <Route
                      path="/offers"
                      element={
                        <div className="max-w-7xl mx-auto px-4 py-8">
                          <h1 className="text-2xl font-bold">Browse Offers</h1>
                          <p className="text-gray-600 mt-2">Coming soon...</p>
                        </div>
                      }
                    />
                    
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.BUYER]}>
                          <BuyerProfile />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Error routes */}
                    <Route
                      path="/unauthorized"
                      element={
                        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                          <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
                          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
                        </div>
                      }
                    />
                    
                    <Route
                      path="*"
                      element={
                        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                          <h1 className="text-2xl font-bold">Page Not Found</h1>
                          <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
                        </div>
                      }
                    />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;