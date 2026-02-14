'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import VendorDashboard from '@/components/pages/VendorDashboard';

export default function VendorDashboardPage() {
  return (
    <ProtectedRoute requiredRole="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  );
}
