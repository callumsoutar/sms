import { supabase } from '../../../../lib/supabase';
import { BarChart, PieChart, LineChart, Calendar, FileBarChart, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const metadata = {
  title: 'Safety Reports - Aviation SMS',
  description: 'View safety metrics and statistics',
};

export default async function ReportsPage() {
  // Fetch occurrence statistics
  const { data: occurrenceStats, error: occurrenceError } = await supabase
    .from('occurrences')
    .select('occurrence_type, status, severity, occurrence_date');

  if (occurrenceError) {
    console.error('Error fetching occurrence statistics:', occurrenceError);
  }

  // Fetch action statistics
  const { data: actionStats, error: actionError } = await supabase
    .from('corrective_actions')
    .select('status, due_date');

  if (actionError) {
    console.error('Error fetching action statistics:', actionError);
  }

  // Calculate occurrence type distribution
  const occurrenceTypeDistribution = occurrenceStats?.reduce((acc, curr) => {
    acc[curr.occurrence_type] = (acc[curr.occurrence_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate occurrence status distribution
  const occurrenceStatusDistribution = occurrenceStats?.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate severity distribution
  const severityDistribution = occurrenceStats?.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate action status distribution
  const actionStatusDistribution = actionStats?.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate occurrences by month
  const occurrencesByMonth = occurrenceStats?.reduce((acc, curr) => {
    const date = new Date(curr.occurrence_date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Sort months chronologically
  const sortedMonths = Object.keys(occurrencesByMonth).sort();
  
  // Get the last 12 months or all months if less than 12
  const recentMonths = sortedMonths.slice(-12);
  
  // Format month labels
  const monthLabels = recentMonths.map(month => {
    const [year, monthNum] = month.split('-');
    return `${new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  });

  // Get occurrence counts for recent months
  const occurrenceCounts = recentMonths.map(month => occurrencesByMonth[month]);

  // Calculate overdue actions
  const overdueActions = actionStats?.filter(action => 
    action.status !== 'completed' && 
    action.due_date && 
    new Date(action.due_date) < new Date()
  ).length || 0;

  // Calculate completion rate
  const completedActions = actionStats?.filter(action => action.status === 'completed').length || 0;
  const totalActions = actionStats?.length || 0;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Calculate total occurrences
  const totalOccurrences = occurrenceStats?.length || 0;

  // Calculate open occurrences
  const openOccurrences = occurrenceStats?.filter(occurrence => 
    occurrence.status === 'reported' || occurrence.status === 'in_review' || occurrence.status === 'under_investigation'
  ).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Safety Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">
          View safety metrics and statistics for your organization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <FileBarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Occurrences</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalOccurrences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Open Occurrences</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{openOccurrences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Action Completion</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Overdue Actions</h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{overdueActions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occurrences by Month */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <LineChart className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Occurrences by Month</h2>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="h-64 flex items-end space-x-2">
              {recentMonths.map((month, index) => (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 dark:bg-blue-600 rounded-t"
                    style={{ 
                      height: `${Math.max(occurrenceCounts[index] / Math.max(...occurrenceCounts) * 100, 5)}%`,
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {monthLabels[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Occurrence Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Occurrence Types</h2>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              {Object.entries(occurrenceTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center">
                  <div className="w-32 text-sm text-gray-500 dark:text-gray-400">{type}</div>
                  <div className="flex-1">
                    <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-500 dark:bg-blue-600"
                        style={{ width: `${(count / totalOccurrences) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Severity Distribution</h2>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              {Object.entries(severityDistribution).map(([severity, count]) => {
                let barColor;
                switch (severity) {
                  case 'low':
                    barColor = 'bg-green-500 dark:bg-green-600';
                    break;
                  case 'medium':
                    barColor = 'bg-yellow-500 dark:bg-yellow-600';
                    break;
                  case 'high':
                    barColor = 'bg-orange-500 dark:bg-orange-600';
                    break;
                  case 'critical':
                    barColor = 'bg-red-500 dark:bg-red-600';
                    break;
                  default:
                    barColor = 'bg-blue-500 dark:bg-blue-600';
                }
                
                return (
                  <div key={severity} className="flex items-center">
                    <div className="w-32 text-sm text-gray-500 dark:text-gray-400">{severity}</div>
                    <div className="flex-1">
                      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${barColor}`}
                          style={{ width: `${(count / totalOccurrences) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Action Status</h2>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              {Object.entries(actionStatusDistribution).map(([status, count]) => {
                let barColor;
                switch (status) {
                  case 'pending':
                    barColor = 'bg-yellow-500 dark:bg-yellow-600';
                    break;
                  case 'in_progress':
                    barColor = 'bg-blue-500 dark:bg-blue-600';
                    break;
                  case 'completed':
                    barColor = 'bg-green-500 dark:bg-green-600';
                    break;
                  case 'overdue':
                    barColor = 'bg-red-500 dark:bg-red-600';
                    break;
                  default:
                    barColor = 'bg-gray-500 dark:bg-gray-600';
                }
                
                return (
                  <div key={status} className="flex items-center">
                    <div className="w-32 text-sm text-gray-500 dark:text-gray-400">{status.replace('_', ' ')}</div>
                    <div className="flex-1">
                      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${barColor}`}
                          style={{ width: `${(count / totalActions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Note about data */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Note: This report shows data based on the current state of the system. For more detailed reports or custom date ranges, please contact your system administrator.</p>
      </div>
    </div>
  );
} 