'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerDashboard from '@/components/pages/CustomerDashboard';

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  );
}
