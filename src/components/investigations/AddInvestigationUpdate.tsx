'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Loader2 } from 'lucide-react';

interface AddInvestigationUpdateProps {
  investigationId: string;
  onUpdateAdded: () => void;
}

export default function AddInvestigationUpdate({ 
  investigationId, 
  onUpdateAdded 
}: AddInvestigationUpdateProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateText.trim()) {
      setError('Update text cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('investigation_updates')
        .insert({
          investigation_id: investigationId,
          user_id: user.id,
          note: updateText,
        });
      
      if (error) throw error;
      
      setUpdateText('');
      setIsAdding(false);
      onUpdateAdded();
    } catch (err) {
      console.error('Error adding investigation update:', err);
      setError('Failed to add update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        <PlusCircle className="h-4 w-4 mr-1" />
        Add Update
      </button>
    );
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Investigation Update</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="updateText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Update Details
          </label>
          <textarea
            id="updateText"
            rows={4}
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
            placeholder="Enter update details..."
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setUpdateText('');
              setError(null);
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Update'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 