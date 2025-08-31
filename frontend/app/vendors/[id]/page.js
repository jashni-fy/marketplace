import VendorProfile from '../../../components/pages/VendorProfile';

export const metadata = {
  title: 'Vendor Profile - Marketplace',
  description: 'View vendor profile and services',
};

export default function VendorProfilePage({ params }) {
  return <VendorProfile params={params} />;
}