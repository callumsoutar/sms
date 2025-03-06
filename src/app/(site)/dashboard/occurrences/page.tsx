import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import { AlertTriangle, Plus } from 'lucide-react';
import { formatDateOnly } from '../../../../lib/utils';
import OccurrenceFilters from '../../../../components/occurrences/OccurrenceFilters';

export const metadata = {
  title: 'Occurrences - Aviation SMS',
  description: 'List of safety occurrences',
};

// Define types for the occurrence data
interface Aircraft {
  registration: string;
}

interface Reporter {
  full_name: string;
}

interface Occurrence {
  id: string;
  title: string;
  occurrence_date: string;
  location: string;
  occurrence_type: string;
  severity: string;
  status: string;
  description: string;
  created_at: string;
  aircraft?: Aircraft;
  reporter?: Reporter;
}

export default async function OccurrencesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse query parameters
  const status = searchParams.status as string | undefined;
  const type = searchParams.type as string | undefined;
  const period = searchParams.period as string | undefined;
  const search = searchParams.search as string | undefined;
  
  // Build query
  let query = supabase
    .from('occurrences')
    .select(`
      id,
      title,
      occurrence_date,
      location,
      occurrence_type,
      severity,
      status,
      description,
      created_at,
      aircraft:aircraft_id (registration),
      reporter:reporter_id (full_name)
    `)
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (status === 'open') {
    query = query.not('status', 'eq', 'closed');
  } else if (status === 'closed') {
    query = query.eq('status', 'closed');
  } else if (status) {
    query = query.eq('status', status);
  }
  
  if (type) {
    query = query.eq('occurrence_type', type);
  }
  
  if (period === '30days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte('occurrence_date', thirtyDaysAgo.toISOString());
  }
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  
  // Execute query
  const { data: occurrences, error } = await query;
  
  if (error) {
    console.error('Error fetching occurrences:', error);
  }

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'under_investigation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Helper function to get occurrence type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'incident':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'accident':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'hazard':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'observation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Helper function to get severity level badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Cast the occurrences data to the proper type
  const typedOccurrences = occurrences as unknown as Occurrence[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Occurrences</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage safety occurrences
          </p>
        </div>
        <Link
          href="/dashboard/occurrences/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Report Occurrence
        </Link>
      </div>
      
      {/* Filters - Now using the Client Component */}
      <OccurrenceFilters 
        initialStatus={status}
        initialType={type}
        initialPeriod={period}
      />
      
      {/* Occurrences List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Occurrence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aircraft
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {typedOccurrences && typedOccurrences.length > 0 ? (
                typedOccurrences.map((occurrence) => (
                  <tr key={occurrence.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <Link 
                            href={`/dashboard/occurrences/${occurrence.id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            {occurrence.title}
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Reported by: {occurrence.reporter?.full_name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateOnly(occurrence.occurrence_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {occurrence.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {occurrence.aircraft?.registration || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(occurrence.occurrence_type)}`}>
                        {occurrence.occurrence_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(occurrence.severity)}`}>
                        {occurrence.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(occurrence.status)}`}>
                        {occurrence.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-base font-medium text-gray-900 dark:text-white mb-1">No occurrences found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or report a new occurrence.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 