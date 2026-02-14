import { Suspense } from 'react';
import ServiceSearch from '../../components/pages/ServiceSearch';

export const metadata = {
  title: 'Search Services - Marketplace',
  description: 'Search and filter professional services',
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading services...</div>}>
      <ServiceSearch />
    </Suspense>
  );
}