import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { StripeProvider } from './contexts/StripeContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CreateOfferPage } from './pages/CreateOfferPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerOffersPage } from './pages/BuyerOffersPage';
import { TicketSearchPage } from './pages/TicketSearchPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerOffersPage } from './pages/SellerOffersPage';
import { BuyerTransactionsPage } from './pages/BuyerTransactionsPage';
import { SellerTransactionsPage } from './pages/SellerTransactionsPage';
import { BuyerProfile } from './components/profile/BuyerProfile';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ListingManagementPage } from './pages/ListingManagementPage';
import { BrowseTicketsPage } from './pages/BrowseTicketsPage';
import { BrowseOffersPage } from './pages/BrowseOffersPage';
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
        <StripeProvider>
          <Router>
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Routes with layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:id" element={<EventDetailPage />} />
                    
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
                    
                    <Route
                      path="/checkout/:transactionId"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.BUYER]}>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Admin routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                          <AdminUsersPage />
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
                          <ListingManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/seller/listings"
                      element={
                        <ProtectedRoute requiredRoles={[UserRole.SELLER]}>
                          <ListingManagementPage />
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
                    <Route path="/listings" element={<BrowseTicketsPage />} />
                    <Route path="/offers" element={<BrowseOffersPage />} />
                    
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
        </StripeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;