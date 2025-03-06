'use client';

import Link from 'next/link';
import { Occurrence, OccurrenceType, SeverityLevel } from '../../types/schema';

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'reported':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    case 'in_review':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'under_investigation':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
    case 'closed':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

// Helper function to get occurrence type badge color
const getTypeColor = (type: OccurrenceType) => {
  switch (type) {
    case 'incident':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
    case 'accident':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    case 'hazard':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'observation':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

// Helper function to get severity level badge color
const getSeverityColor = (severity: SeverityLevel) => {
  switch (severity) {
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

// Format date to readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface OccurrenceListProps {
  occurrences: any[]; // Using any[] to avoid TypeScript errors with Supabase return types
}

export default function OccurrenceList({ occurrences }: OccurrenceListProps) {
  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {occurrences.map((occurrence) => (
          <li key={occurrence.id} className="py-4">
            <Link href={`/dashboard/occurrences/${occurrence.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="px-4 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {occurrence.title}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(occurrence.status)}`}>
                      {occurrence.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {occurrence.aircraft?.registration || 'No aircraft'}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                      {occurrence.location}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                    <p>
                      {formatDate(occurrence.occurrence_date)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(occurrence.occurrence_type)}`}>
                    {occurrence.occurrence_type}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(occurrence.severity)}`}>
                    {occurrence.severity}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 