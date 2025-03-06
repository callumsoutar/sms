'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ClipboardList, 
  AlertTriangle,
  X
} from 'lucide-react';

interface OccurrenceActionsProps {
  occurrence: any;
}

export default function OccurrenceActions({ occurrence }: OccurrenceActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidReason, setInvalidReason] = useState('');

  // Start an investigation
  const startInvestigation = async () => {
    setIsUpdating(true);
    setError(null);
    
    try {
      // Create a new investigation
      const { error: investigationError } = await supabase
        .from('investigations')
        .insert({
          occurrence_id: occurrence.id,
          stage: 'not_started',
          started_at: new Date().toISOString(),
        });
      
      if (investigationError) throw investigationError;
      
      // Update the occurrence status
      const { error: occurrenceError } = await supabase
        .from('occurrences')
        .update({ status: 'under_investigation' })
        .eq('id', occurrence.id);
      
      if (occurrenceError) throw occurrenceError;
      
      // Force a complete page refresh to ensure all data is reloaded
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to start investigation');
    } finally {
      setIsUpdating(false);
    }
  };

  // Mark occurrence as invalid
  const markAsInvalid = async () => {
    if (!invalidReason.trim()) {
      setError('Please provide a reason for marking this occurrence as invalid');
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('occurrences')
        .update({ 
          status: 'closed',
          is_invalid: true,
          invalid_reason: invalidReason
        })
        .eq('id', occurrence.id);
      
      if (updateError) throw updateError;
      
      setShowInvalidModal(false);
      // Force a complete page refresh to ensure all data is reloaded
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to mark occurrence as invalid');
    } finally {
      setIsUpdating(false);
    }
  };

  // If the occurrence is already closed or under investigation, don't show actions
  if (occurrence.status === 'closed' || occurrence.status === 'under_investigation' || occurrence.investigation) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Actions</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          <button
            onClick={startInvestigation}
            disabled={isUpdating}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Begin Investigation
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowInvalidModal(true)}
            disabled={isUpdating}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <XCircle className="mr-2 h-5 w-5 text-red-500 dark:text-red-400" />
            Mark as Invalid
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Invalid Reason Modal */}
      {showInvalidModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mark as Invalid</h3>
              </div>
              <button 
                onClick={() => setShowInvalidModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Please provide a reason for marking this occurrence as invalid. This will close the occurrence and prevent any investigation.
              </p>
              
              <div className="mt-2">
                <label htmlFor="invalid-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  id="invalid-reason"
                  value={invalidReason}
                  onChange={(e) => setInvalidReason(e.target.value)}
                  placeholder="Explain why this occurrence is being marked as invalid..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  rows={4}
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowInvalidModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={markAsInvalid}
                  disabled={isUpdating || !invalidReason.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 