'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Aircraft } from '../../types/schema';
import { supabase } from '../../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface AircraftFormProps {
  aircraft?: Aircraft;
}

export default function AircraftForm({ aircraft }: AircraftFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [registration, setRegistration] = useState(aircraft?.registration || '');
  const [type, setType] = useState(aircraft?.type || '');
  const [model, setModel] = useState(aircraft?.model || '');
  const [year, setYear] = useState<number | undefined>(aircraft?.year);
  const [status, setStatus] = useState(aircraft?.status || 'active');
  const [notes, setNotes] = useState(aircraft?.notes || '');

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'retired', label: 'Retired' },
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!registration || !type || !model || !status) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare data
      const aircraftData = {
        registration,
        type,
        model,
        year: year || null,
        status,
        notes: notes || null,
      };

      let response;

      if (aircraft) {
        // Update existing aircraft
        response = await supabase
          .from('aircraft')
          .update(aircraftData)
          .eq('id', aircraft.id);
      } else {
        // Create new aircraft
        response = await supabase
          .from('aircraft')
          .insert([aircraftData]);
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Redirect after successful submission
      if (aircraft) {
        router.push(`/dashboard/aircraft/${aircraft.id}`);
      } else {
        router.push('/dashboard/aircraft');
      }
      
      // Refresh the page data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="registration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Registration *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="registration"
              name="registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              required
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Model *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="model"
              name="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Year
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="year"
              name="year"
              value={year || ''}
              onChange={(e) => setYear(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              min="1900"
              max={new Date().getFullYear()}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status *
          </label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Additional information about this aircraft.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : aircraft ? 'Update Aircraft' : 'Create Aircraft'}
        </button>
      </div>
    </form>
  );
} 