'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, RefreshCw } from 'lucide-react';
import AddInvestigationUpdate from './AddInvestigationUpdate';

interface User {
  id: string;
  full_name?: string;
  email?: string;
}

interface InvestigationUpdate {
  id: string;
  investigation_id: string;
  user_id: string;
  note: string;
  created_at: string;
  user?: User;
}

interface InvestigationUpdatesProps {
  investigationId: string;
}

export default function InvestigationUpdates({ investigationId }: InvestigationUpdatesProps) {
  const [updates, setUpdates] = useState<InvestigationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('investigation_updates')
        .select(`
          *,
          user:user_id (id, full_name, email)
        `)
        .eq('investigation_id', investigationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUpdates(data as unknown as InvestigationUpdate[]);
    } catch (err) {
      console.error('Error fetching investigation updates:', err);
      setError('Failed to load updates. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investigationId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUpdates();
  };

  const handleUpdateAdded = () => {
    fetchUpdates();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Investigation Updates</h2>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {loading && !refreshing ? (
          <div className="py-8 flex justify-center">
            <RefreshCw className="h-6 w-6 text-gray-400 dark:text-gray-500 animate-spin" />
          </div>
        ) : updates.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No updates yet</p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {update.user?.full_name || update.user?.email || 'Unknown User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{update.note}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <AddInvestigationUpdate 
          investigationId={investigationId} 
          onUpdateAdded={handleUpdateAdded} 
        />
      </div>
    </div>
  );
} 