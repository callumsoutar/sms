import { Metadata } from 'next';
import TrailerManagement from '@/components/trailers/TrailerManagement';

export const metadata: Metadata = {
  title: 'Trailers | Aviation Safety Management System',
  description: 'Manage fuel trailers for your aviation operations',
};

export default function TrailersPage() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Trailers</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and monitor your aviation fuel trailers
        </p>
      </div>
      
      <TrailerManagement />
    </div>
  );
} 