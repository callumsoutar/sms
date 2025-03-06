import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../../lib/supabase';
import OccurrenceDetails from '../../../../../components/occurrences/OccurrenceDetails';
import InvestigationPanel from '../../../../../components/investigations/InvestigationPanel';
import OccurrenceActions from '../../../../../components/occurrences/OccurrenceActions';
import InvalidOccurrenceAlert from '../../../../../components/occurrences/InvalidOccurrenceAlert';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Plane, 
  User, 
  AlertTriangle, 
  Clock, 
  Shield, 
  FileText,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClipboardList,
  Search,
  Beaker,
  Lightbulb,
  CheckSquare,
  Info
} from 'lucide-react';
import { formatDateOnly, formatDate } from '../../../../../lib/utils';
import { OccurrenceStatus, OccurrenceType, SeverityLevel, InvestigationStage } from '../../../../../types/schema';

export const metadata = {
  title: 'Occurrence Details - Aviation SMS',
  description: 'View occurrence details and investigation',
};

// Define types for the occurrence and related data
interface Reporter {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  department?: string;
}

interface Aircraft {
  id: string;
  registration: string;
  model?: string;
  type?: string;
}

interface Investigation {
  id: string;
  occurrence_id: string;
  lead_investigator_id: string;
  stage: InvestigationStage;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  lead_investigator?: Reporter;
}

interface Occurrence {
  id: string;
  title: string;
  occurrence_date: string;
  location: string;
  occurrence_type: OccurrenceType;
  severity: SeverityLevel;
  status: OccurrenceStatus;
  description: string;
  reporter_id: string;
  aircraft_id?: string;
  assigned_to?: string;
  weather_conditions?: string;
  flight_phase?: string;
  immediate_actions?: string;
  created_at: string;
  updated_at: string;
  is_invalid?: boolean;
  invalid_reason?: string;
  reporter?: Reporter;
  aircraft?: Aircraft;
  investigation?: Investigation;
}

interface Attachment {
  id: string;
  occurrence_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_by: string;
  created_at: string;
}

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'reported':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'in_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'under_investigation':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    case 'closed':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  }
};

// Helper function to get occurrence type badge color
const getTypeColor = (type: string) => {
  switch (type) {
    case 'incident':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    case 'accident':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    case 'hazard':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'observation':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  }
};

// Helper function to get severity level badge color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  }
};

// Helper function to get investigation stage badge color
const getStageColor = (stage: InvestigationStage) => {
  switch (stage) {
    case 'not_started':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    case 'data_collection':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'analysis':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'recommendations':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    case 'review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  }
};

// Helper function to get severity icon
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'low':
      return <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />;
    case 'medium':
      return <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
    case 'critical':
      return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
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

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Get investigation progress percentage
const getInvestigationProgress = (stage: InvestigationStage) => {
  switch (stage) {
    case 'not_started':
      return 0;
    case 'data_collection':
      return 20;
    case 'analysis':
      return 40;
    case 'recommendations':
      return 60;
    case 'review':
      return 80;
    case 'completed':
      return 100;
    default:
      return 0;
  }
};

export default async function OccurrenceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Get occurrence with related data
  const { data: occurrenceData, error } = await supabase
    .from('occurrences')
    .select(`
      *,
      aircraft:aircraft_id (*),
      reporter:reporter_id (*),
      assigned_to:assigned_to (*)
    `)
    .eq('id', params.id)
    .single();
  
  if (error || !occurrenceData) {
    console.error('Error fetching occurrence:', error);
    notFound();
  }
  
  // Cast the data to our defined types
  const occurrence = occurrenceData as unknown as Occurrence;
  
  // Get investigation separately
  const { data: investigationData } = await supabase
    .from('investigations')
    .select(`
      *,
      lead_investigator:lead_investigator_id (*)
    `)
    .eq('occurrence_id', params.id)
    .maybeSingle();
  
  if (investigationData) {
    occurrence.investigation = investigationData as unknown as Investigation;
  }
  
  // Get attachments
  const { data: attachmentsData } = await supabase
    .from('attachments')
    .select('*')
    .eq('occurrence_id', params.id);
    
  const attachments = attachmentsData as Attachment[] || [];
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Back navigation */}
      <div className="mb-6">
        <Link 
          href="/dashboard/occurrences" 
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Occurrences
        </Link>
      </div>
      
      {/* Invalid Alert */}
      {occurrence.is_invalid && (
        <InvalidOccurrenceAlert invalidReason={occurrence.invalid_reason || ''} />
      )}
      
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {/* Title and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{occurrence.title}</h1>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(occurrence.status)}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    occurrence.status === 'closed' ? 'bg-green-500' : 
                    occurrence.status === 'under_investigation' ? 'bg-purple-500' : 
                    occurrence.status === 'in_review' ? 'bg-yellow-500' : 
                    'bg-blue-500'
                  }`}></span>
                  {occurrence.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            
            {/* Key Information Badges */}
            <div className="flex flex-wrap gap-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(occurrence.occurrence_type)}`}>
                <Tag className="h-4 w-4 mr-2" />
                {occurrence.occurrence_type}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(occurrence.severity)}`}>
                {getSeverityIcon(occurrence.severity)}
                <span className="ml-2">{occurrence.severity} severity</span>
              </div>
              {occurrence.flight_phase && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  <Plane className="h-4 w-4 mr-2" />
                  {occurrence.flight_phase}
                </div>
              )}
            </div>
            
            {/* Essential Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Date & Time</span>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium">{formatDate(occurrence.occurrence_date)}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium">{occurrence.location}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Aircraft</span>
                <div className="flex items-center mt-1">
                  <Plane className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium">
                    {occurrence.aircraft?.registration || 'N/A'}
                    {occurrence.aircraft?.type && <span className="text-gray-500 ml-1">({occurrence.aircraft.type})</span>}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Reported</span>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium">{formatDateOnly(occurrence.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Description and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Investigation Progress (if under investigation) */}
          {occurrence.investigation && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Investigation Progress</h2>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(occurrence.investigation.stage)}`}>
                    {occurrence.investigation.stage.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                      style={{ width: `${getInvestigationProgress(occurrence.investigation.stage)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {['not_started', 'data_collection', 'analysis', 'recommendations', 'review', 'completed'].map((stage, index) => {
                    const isActive = getInvestigationProgress(occurrence.investigation?.stage as InvestigationStage) >= getInvestigationProgress(stage as InvestigationStage);
                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                          {getStageIcon(stage as InvestigationStage)}
                        </div>
                        <span className="mt-2 text-xs text-center text-gray-600 dark:text-gray-400">
                          {stage.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Description Card */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Description</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{occurrence.description}</p>
              </div>
              
              {occurrence.immediate_actions && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Immediate Actions Taken
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{occurrence.immediate_actions}</p>
                </div>
              )}
              
              {occurrence.weather_conditions && (
                <div className="mt-4">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Weather Conditions</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{occurrence.weather_conditions}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Occurrence Details Component */}
          <OccurrenceDetails occurrence={occurrence} attachments={attachments} />
        </div>
        
        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Investigation Actions Panel */}
          {occurrence.investigation ? (
            <InvestigationPanel investigation={occurrence.investigation} occurrenceId={occurrence.id} />
          ) : occurrence.is_invalid ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invalid Occurrence</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This occurrence has been marked as invalid and will not be investigated.
                </p>
              </div>
            </div>
          ) : (
            <OccurrenceActions occurrence={occurrence} />
          )}
          
          {/* Reporter Information */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Reporter Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {occurrence.reporter?.full_name || 'Unknown'}
                  </p>
                </div>
                
                {occurrence.reporter?.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {occurrence.reporter.email}
                    </p>
                  </div>
                )}
                
                {occurrence.reporter?.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {occurrence.reporter.phone}
                    </p>
                  </div>
                )}
                
                {occurrence.reporter?.department && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {occurrence.reporter.department}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Aircraft Information */}
          {occurrence.aircraft && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                <div className="flex items-center">
                  <Plane className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Aircraft Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Registration</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {occurrence.aircraft.registration}
                    </p>
                  </div>
                  
                  {occurrence.aircraft.type && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {occurrence.aircraft.type}
                      </p>
                    </div>
                  )}
                  
                  {occurrence.aircraft.model && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {occurrence.aircraft.model}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 