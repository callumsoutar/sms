'use client';

import { useState } from 'react';
import { Attachment } from '../../types/schema';
import { 
  Paperclip, 
  Calendar, 
  MapPin, 
  Plane, 
  User, 
  FileText, 
  MessageSquare, 
  Download,
  Shield,
  Clock,
  Upload,
  Plus,
  Send,
  X
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface OccurrenceDetailsProps {
  occurrence: any; // Using any to avoid TypeScript errors with Supabase return types
  attachments: Attachment[];
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

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

export default function OccurrenceDetails({ occurrence, attachments }: OccurrenceDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <nav className="flex px-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'details' ? 'page' : undefined}
          >
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'attachments'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'attachments' ? 'page' : undefined}
          >
            <div className="flex items-center">
              <Paperclip className="h-4 w-4 mr-2" />
              Attachments
              {attachments.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full px-2 py-0.5 border border-blue-200 dark:border-blue-800">
                  {attachments.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'comments' ? 'page' : undefined}
          >
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </div>
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* This section is now handled by the main page */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Additional details about this occurrence will be displayed here.
            </p>
          </div>
        )}
        
        {activeTab === 'attachments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attachments</h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </button>
            </div>
            
            {attachments.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="relative group">
                    <div className="block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center h-full">
                        <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="absolute inset-0 bg-gray-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                          href={attachment.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="block text-sm font-medium text-gray-900 dark:text-white truncate pointer-events-none">
                        {attachment.file_name}
                      </p>
                      <p className="block text-xs font-medium text-gray-500 dark:text-gray-400 pointer-events-none">
                        {formatFileSize(attachment.file_size)} • {formatDate(attachment.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <Paperclip className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No attachments</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload files related to this occurrence
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h3>
              <button
                onClick={() => setShowCommentForm(true)}
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Comment
              </button>
            </div>
            
            {showCommentForm ? (
              <div className="mb-6 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">New Comment</h4>
                  <button
                    onClick={() => setShowCommentForm(false)}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                  placeholder="Add your comment here..."
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No comments yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Start the conversation about this occurrence
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCommentForm(true)}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </button>
                </div>
              </div>
            )}
            
            {/* Sample comments would go here */}
            <div className="mt-6 space-y-4">
              {/* This is where comments would be displayed */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 