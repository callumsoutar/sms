import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import { User, Clock } from 'lucide-react';
import { formatDateOnly } from '../../../../lib/utils';
import { InvestigationStage } from '../../../../types/schema';
import InvestigationFilters from '../../../../components/investigations/InvestigationFilters';

export const metadata = {
  title: 'Investigations - Aviation SMS',
  description: 'List of safety investigations',
};

// Define types for the investigation data
interface Profile {
  full_name: string;
}

interface Occurrence {
  id: string;
  title: string;
  occurrence_date: string;
}

interface Investigation {
  id: string;
  occurrence_id: string;
  lead_investigator_id?: string;
  stage: InvestigationStage;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  lead_investigator?: Profile;
  occurrence?: Occurrence;
}

export default async function InvestigationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse query parameters
  const stage = searchParams.stage as string | undefined;
  const period = searchParams.period as string | undefined;
  const search = searchParams.search as string | undefined;
  
  // Build query
  let query = supabase
    .from('investigations')
    .select(`
      id,
      occurrence_id,
      lead_investigator_id,
      stage,
      started_at,
      completed_at,
      created_at,
      updated_at,
      lead_investigator:lead_investigator_id (full_name),
      occurrence:occurrence_id (id, title, occurrence_date)
    `)
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (stage) {
    query = query.eq('stage', stage);
  }
  
  if (period === '30days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte('created_at', thirtyDaysAgo.toISOString());
  }
  
  if (search) {
    // Search in related occurrence titles
    query = query.textSearch('occurrence.title', search, {
      config: 'english',
      type: 'websearch'
    });
  }
  
  // Execute query
  const { data: investigations, error } = await query;
  
  if (error) {
    console.error('Error fetching investigations:', error);
  }

  // Cast the investigations data to the proper type
  const typedInvestigations = investigations as unknown as Investigation[];
  
  // Helper function to get stage badge color
  const getStageColor = (stage: InvestigationStage) => {
    switch (stage) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'data_collection':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'analysis':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'recommendations':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Calculate duration in days
  const calculateDuration = (startDate?: string, endDate?: string) => {
    if (!startDate) return 'Not started';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${durationInDays} days`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Investigations</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage safety investigations
          </p>
        </div>
      </div>
      
      {/* Filters - Now using the Client Component */}
      <InvestigationFilters 
        initialStage={stage}
        initialPeriod={period}
      />
      
      {/* Investigations List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Occurrence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lead Investigator
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Started
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {typedInvestigations && typedInvestigations.length > 0 ? (
                typedInvestigations.map((investigation) => (
                  <tr key={investigation.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/dashboard/investigations/${investigation.id}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {investigation.occurrence?.title || 'Unknown Occurrence'}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {investigation.occurrence?.occurrence_date ? formatDateOnly(investigation.occurrence.occurrence_date) : 'Unknown date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(investigation.stage)}`}>
                        {investigation.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {investigation.lead_investigator?.full_name || 'Not assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {investigation.started_at ? formatDateOnly(investigation.started_at) : 'Not started'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {calculateDuration(investigation.started_at, investigation.completed_at)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-base font-medium text-gray-900 dark:text-white mb-1">No investigations found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your filters to see more results.
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