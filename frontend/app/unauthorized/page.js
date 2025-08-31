import Unauthorized from '../../components/pages/Unauthorized';

export const metadata = {
  title: 'Unauthorized - Marketplace',
  description: 'Access denied',
};

export default function UnauthorizedPage() {
  return <Unauthorized />;
}