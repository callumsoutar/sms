'use client';

import Link from 'next/link';
import { AlertOctagon } from 'lucide-react';

export default function EmptyOccurrenceState() {
  return (
    <div className="text-center py-4">
      <AlertOctagon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No occurrences</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        No occurrences have been reported yet.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/occurrences/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Report Occurrence
        </Link>
      </div>
    </div>
  );
} 