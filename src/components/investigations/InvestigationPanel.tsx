'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  ChevronRight, 
  PlusCircle,
  ClipboardList,
  FileText,
  ArrowRight,
  Beaker,
  Lightbulb,
  Search,
  CheckSquare
} from 'lucide-react';
import { InvestigationStage } from '../../types/schema';
import { formatDate } from '../../lib/utils';

interface InvestigationPanelProps {
  investigation: any; // Using any to avoid TypeScript errors with Supabase return types
  occurrenceId: string;
}

// Helper function to get stage color
const getStageColor = (stage: InvestigationStage) => {
  switch (stage) {
    case 'not_started':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600';
    case 'data_collection':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'analysis':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'recommendations':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    case 'review':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600';
  }
};

// Get stage icon
const getStageIcon = (stage: InvestigationStage) => {
  switch (stage) {
    case 'not_started':
      return <ClipboardList className="h-5 w-5" />;
    case 'data_collection':
      return <Search className="h-5 w-5" />;
    case 'analysis':
      return <Beaker className="h-5 w-5" />;
    case 'recommendations':
      return <Lightbulb className="h-5 w-5" />;
    case 'review':
      return <FileText className="h-5 w-5" />;
    case 'completed':
      return <CheckSquare className="h-5 w-5" />;
    default:
      return <ClipboardList className="h-5 w-5" />;
  }
};

export default function InvestigationPanel({ investigation, occurrenceId }: InvestigationPanelProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // If no investigation exists yet
  if (!investigation) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Investigation</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No investigation</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There is no investigation for this occurrence yet.
            </p>
            <div className="mt-6">
              <button
                onClick={async () => {
                  setIsUpdating(true);
                  setError(null);
                  
                  try {
                    const { error } = await supabase
                      .from('investigations')
                      .insert({
                        occurrence_id: occurrenceId,
                        stage: 'not_started',
                        started_at: new Date().toISOString(),
                      });
                    
                    if (error) throw error;
                    
                    // Update the occurrence status
                    await supabase
                      .from('occurrences')
                      .update({ status: 'under_investigation' })
                      .eq('id', occurrenceId);
                    
                    router.refresh();
                  } catch (err: any) {
                    setError(err.message || 'Failed to start investigation');
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Start Investigation
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Update investigation stage
  const updateStage = async (newStage: InvestigationStage) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updates: any = { stage: newStage };
      
      // If moving to completed, set the completed_at date
      if (newStage === 'completed') {
        updates.completed_at = new Date().toISOString();
        
        // Also update the occurrence status to closed
        await supabase
          .from('occurrences')
          .update({ status: 'closed' })
          .eq('id', occurrenceId);
      }
      
      const { error } = await supabase
        .from('investigations')
        .update(updates)
        .eq('id', investigation.id);
      
      if (error) throw error;
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update investigation stage');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get next stage based on current stage
  const getNextStage = (currentStage: InvestigationStage): InvestigationStage | null => {
    switch (currentStage) {
      case 'not_started':
        return 'data_collection';
      case 'data_collection':
        return 'analysis';
      case 'analysis':
        return 'recommendations';
      case 'recommendations':
        return 'review';
      case 'review':
        return 'completed';
      case 'completed':
        return null;
      default:
        return null;
    }
  };
  
  // Get next stage button text
  const getNextStageButtonText = (currentStage: InvestigationStage): string => {
    switch (currentStage) {
      case 'not_started':
        return 'Begin Data Collection';
      case 'data_collection':
        return 'Move to Analysis';
      case 'analysis':
        return 'Develop Recommendations';
      case 'recommendations':
        return 'Submit for Review';
      case 'review':
        return 'Complete Investigation';
      default:
        return 'Update Stage';
    }
  };
  
  // Get next stage icon
  const getNextStageIcon = (currentStage: InvestigationStage) => {
    const nextStage = getNextStage(currentStage);
    return nextStage ? getStageIcon(nextStage) : null;
  };
  
  // Get next stage color
  const getNextStageColor = (currentStage: InvestigationStage): string => {
    switch (currentStage) {
      case 'not_started':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'data_collection':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'analysis':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'recommendations':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'review':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };
  
  const nextStage = getNextStage(investigation.stage);
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Investigation Actions</h2>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageColor(investigation.stage)}`}>
            {investigation.stage.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Next Stage Button */}
          {nextStage && (
            <button
              onClick={() => updateStage(nextStage)}
              disabled={isUpdating}
              className="w-full flex justify-between items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getNextStageColor(investigation.stage)} flex items-center justify-center mr-3`}>
                  {getNextStageIcon(investigation.stage)}
                </div>
                <span>{getNextStageButtonText(investigation.stage)}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          {error && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Investigation Details */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Lead Investigator */}
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lead Investigator</p>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {investigation.lead_investigator?.full_name || 'Not assigned'}
                </p>
              </div>
            </div>
            
            {/* Started Date */}
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Started</p>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatDate(investigation.started_at)}
                </p>
              </div>
            </div>
            
            {/* Completed Date (if applicable) */}
            {investigation.completed_at && (
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {formatDate(investigation.completed_at)}
                  </p>
                </div>
              </div>
            )}
            
            {/* Duration (if not completed) */}
            {!investigation.completed_at && investigation.started_at && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {Math.ceil((new Date().getTime() - new Date(investigation.started_at).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* View Full Investigation Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push(`/dashboard/investigations/${investigation.id}`)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View Full Investigation
          </button>
        </div>
      </div>
    </div>
  );
} 