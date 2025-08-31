import NotFound from '../components/pages/NotFound';

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist',
};

export default function NotFoundPage() {
  return <NotFound />;
}