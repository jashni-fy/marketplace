import ProtectedRoute from '../../../components/ProtectedRoute';
import BookingFlow from '../../../components/pages/BookingFlow';

export const metadata = {
  title: 'Book Service - Marketplace',
  description: 'Book your selected service',
};

export default function BookingPage({ params }) {
  return (
    <ProtectedRoute requiredRole="customer">
      <BookingFlow params={params} />
    </ProtectedRoute>
  );
}