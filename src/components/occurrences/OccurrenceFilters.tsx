'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface OccurrenceFiltersProps {
  initialStatus?: string;
  initialType?: string;
  initialPeriod?: string;
}

export default function OccurrenceFilters({
  initialStatus,
  initialType,
  initialPeriod,
}: OccurrenceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (filterName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(filterName, value);
    } else {
      params.delete(filterName);
    }
    
    router.push(`/dashboard/occurrences?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-auto">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            defaultValue={initialStatus || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="reported">Reported</option>
            <option value="in_review">In Review</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            id="type-filter"
            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            defaultValue={initialType || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="incident">Incident</option>
            <option value="accident">Accident</option>
            <option value="hazard">Hazard</option>
            <option value="observation">Observation</option>
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Period
          </label>
          <select
            id="period-filter"
            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            defaultValue={initialPeriod || ''}
            onChange={(e) => handleFilterChange('period', e.target.value)}
          >
            <option value="">All Time</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
        
        <div className="w-full md:w-auto md:ml-auto flex items-end">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              id="search"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search occurrences..."
              onChange={(e) => {
                if (e.target.value) {
                  handleFilterChange('search', e.target.value);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 