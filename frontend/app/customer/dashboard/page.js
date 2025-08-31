import ProtectedRoute from '../../../components/ProtectedRoute';
import CustomerDashboard from '../../../components/pages/CustomerDashboard';

export const metadata = {
  title: 'Customer Dashboard - Marketplace',
  description: 'Manage your bookings and profile',
};

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  );
}