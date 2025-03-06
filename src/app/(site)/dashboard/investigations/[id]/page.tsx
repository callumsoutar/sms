import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../../lib/supabase';
import { ArrowLeft, Calendar, CheckCircle, Clock, User, MapPin, Plane, AlertTriangle, FileText, MessageSquare, ClipboardList } from 'lucide-react';
import { formatDateOnly } from '../../../../../lib/utils';
import { InvestigationStage } from '../../../../../types/schema';
import InvestigationUpdates from '../../../../../components/investigations/InvestigationUpdates';

export const metadata = {
  title: 'Investigation Details - Aviation SMS',
  description: 'View investigation details and findings',
};

// Define interfaces for the data structure
interface Aircraft {
  registration: string;
}

interface Profile {
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
  aircraft?: Aircraft;
}

interface InvestigationUpdate {
  id: string;
  note: string;
  created_at: string;
  user?: Profile;
}

interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date?: string;
  assignee?: Profile;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface Investigation {
  id: string;
  occurrence_id: string;
  lead_investigator_id?: string;
  stage: InvestigationStage;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  findings?: string;
  root_causes?: string;
  contributing_factors?: string;
  recommendations?: string;
  lead_investigator?: Profile;
  occurrence?: Occurrence;
  updates?: InvestigationUpdate[];
  corrective_actions?: CorrectiveAction[];
}

// Helper function to get stage color
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

// Format date to readable format
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default async function InvestigationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Get investigation with related data
  const { data, error } = await supabase
    .from('investigations')
    .select(`
      *,
      lead_investigator:lead_investigator_id (*),
      occurrence:occurrence_id (*),
      updates:investigation_updates (
        *,
        user:user_id (*)
      ),
      corrective_actions:corrective_actions (
        *,
        assignee:assigned_to (*)
      )
    `)
    .eq('id', params.id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching investigation:', error);
    notFound();
  }

  // Cast the data to our Investigation type
  const investigation = data as unknown as Investigation;
  
  // Get attachments
  const { data: attachments } = await supabase
    .from('attachments')
    .select('*')
    .eq('investigation_id', params.id);
  
  // Calculate duration in days
  const calculateDuration = (startDate?: string | null, endDate?: string | null) => {
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
          <div className="flex items-center">
            <Link 
              href="/dashboard/investigations" 
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Investigations
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Investigation: {investigation.occurrence?.title || 'Unknown Occurrence'}
          </h1>
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(investigation.stage)}`}>
              {investigation.stage.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Occurrence Details */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Occurrence Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {investigation.occurrence?.occurrence_date ? formatDateOnly(investigation.occurrence.occurrence_date) : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {investigation.occurrence?.location || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Plane className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Aircraft</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {investigation.occurrence?.aircraft?.registration || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                    <p className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(investigation.occurrence?.status || '')}`}>
                        {(investigation.occurrence?.status || '').replace(/_/g, ' ')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {investigation.occurrence?.description || 'No description provided.'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Investigation Findings */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Investigation Findings</h2>
            </div>
            <div className="p-6 space-y-6">
              {investigation.findings ? (
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Findings</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {investigation.findings}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No findings yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Findings will be added as the investigation progresses.
                  </p>
                </div>
              )}
              
              {investigation.root_causes && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Root Causes</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {investigation.root_causes}
                  </div>
                </div>
              )}
              
              {investigation.contributing_factors && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Contributing Factors</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {investigation.contributing_factors}
                  </div>
                </div>
              )}
              
              {investigation.recommendations && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {investigation.recommendations}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Corrective Actions */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Corrective Actions</h2>
            </div>
            <div className="p-6">
              {investigation.corrective_actions && investigation.corrective_actions.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {investigation.corrective_actions.map((action: CorrectiveAction) => (
                    <li key={action.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</h3>
                          <div className="mt-1 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              action.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              action.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              action.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {action.status.replace(/_/g, ' ')}
                            </span>
                            {action.due_date && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                Due: {formatDate(action.due_date)}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <User className="h-4 w-4 mr-1" />
                            {action.assignee?.full_name || 'Unassigned'}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No corrective actions</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No corrective actions have been created yet.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Investigation Updates */}
          <InvestigationUpdates investigationId={investigation.id} />
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Investigation Info */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Investigation Info</h2>
            
            <div className="space-y-4">
              {/* Lead Investigator */}
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lead Investigator</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {investigation.lead_investigator?.full_name || 'Not assigned'}
                  </p>
                </div>
              </div>
              
              {/* Started Date */}
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Started</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(investigation.started_at)}
                  </p>
                </div>
              </div>
              
              {/* Completed Date (if applicable) */}
              {investigation.completed_at && (
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(investigation.completed_at)}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Duration */}
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {calculateDuration(investigation.started_at, investigation.completed_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Attachments */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attachments</h2>
            
            {attachments && attachments.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {attachments.map((attachment: Attachment) => (
                  <li key={attachment.id} className="py-3 flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(attachment.created_at)}
                      </p>
                    </div>
                    <a
                      href={attachment.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 flex-shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <FileText className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No attachments</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No attachments have been added to this investigation.
                </p>
              </div>
            )}
          </div>
          
          {/* Link to Occurrence */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <Link
              href={`/dashboard/occurrences/${investigation.occurrence_id}`}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Original Occurrence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}