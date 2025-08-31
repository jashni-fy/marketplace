import ProtectedRoute from '../../../components/ProtectedRoute';
import VendorDashboard from '../../../components/pages/VendorDashboard';

export const metadata = {
  title: 'Vendor Dashboard - Marketplace',
  description: 'Manage your services and bookings',
};

export default function VendorDashboardPage() {
  return (
    <ProtectedRoute requiredRole="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  );
}