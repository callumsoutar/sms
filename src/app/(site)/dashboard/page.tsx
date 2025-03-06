import { Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/dashboard/StatCard';
import RecentOccurrencesTable from '../../../components/dashboard/RecentOccurrencesTable';
import EmptyOccurrenceState from '../../../components/dashboard/EmptyOccurrenceState';
import OccurrenceChart from '../../../components/dashboard/OccurrenceChart';
import { formatDateOnly } from '../../../lib/utils';

export const revalidate = 0;

export default async function DashboardPage() {
  // Get open occurrences count
  const { count: openCount } = await supabase
    .from('occurrences')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');
  
  // Get closed occurrences count
  const { count: closedCount } = await supabase
    .from('occurrences')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'closed');
  
  // Get occurrences in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { count: recentCount } = await supabase
    .from('occurrences')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  // Get overdue actions
  const today = new Date().toISOString();
  const { count: overdueCount } = await supabase
    .from('actions')
    .select('*', { count: 'exact', head: true })
    .lt('due_date', today)
    .eq('status', 'open');
  
  // Get recent occurrences for the table
  const { data: recentOccurrences } = await supabase
    .from('occurrences')
    .select(`
      id,
      title,
      occurrence_date,
      status,
      severity,
      created_at,
      profiles(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Calculate trends (mock data for now)
  const openTrend = { value: 12, label: 'increase', positive: false };
  const closedTrend = { value: 8, label: 'increase', positive: true };
  const recentTrend = { value: 5, label: 'increase', positive: false };
  const overdueTrend = { value: 15, label: 'decrease', positive: true };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome to your Aviation Safety Management System
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Open Occurrences" 
          value={openCount || 0} 
          iconName="AlertTriangle"
          description="Occurrences requiring attention"
          trend={openTrend}
        />
        <StatCard 
          title="Closed Occurrences" 
          value={closedCount || 0} 
          iconName="CheckCircle"
          description="Successfully resolved occurrences"
          trend={closedTrend}
        />
        <StatCard 
          title="Last 30 Days" 
          value={recentCount || 0} 
          iconName="Clock"
          description="Recent safety occurrences"
          trend={recentTrend}
        />
        <StatCard 
          title="Overdue Actions" 
          value={overdueCount || 0} 
          iconName="AlertOctagon"
          description="Actions past their due date"
          trend={overdueTrend}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Occurrences</h2>
          {recentOccurrences && recentOccurrences.length > 0 ? (
            <RecentOccurrencesTable occurrences={recentOccurrences} />
          ) : (
            <EmptyOccurrenceState />
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Occurre
            nce Trends</h2>
          <Suspense fallback={<div>Loading chart...</div>}>
            <OccurrenceChart />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 