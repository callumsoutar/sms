'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { OccurrenceType, SeverityLevel } from '../../types/schema';
import { AlertTriangle, Calendar, Clock, MapPin, Plane, CloudSun, Compass, FileText, ShieldAlert, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import React from 'react';

interface Aircraft {
  id: string;
  registration: string;
  type: string;
  model: string;
}

interface OccurrenceFormProps {
  aircraft: Aircraft[];
  userId: string;
}

export default function OccurrenceForm({ aircraft, userId }: OccurrenceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    title: '',
    occurrence_date: new Date().toISOString().split('T')[0],
    occurrence_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    location: '',
    occurrence_type: 'incident' as OccurrenceType,
    severity: 'medium' as SeverityLevel,
    description: '',
    aircraft_id: '',
    weather_conditions: '',
    flight_phase: '',
    immediate_actions: '',
  });
  
  const [occurrenceTypeOpen, setOccurrenceTypeOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  const occurrenceTypeRef = useRef<HTMLDivElement>(null);
  const severityRef = useRef<HTMLDivElement>(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (occurrenceTypeRef.current && !occurrenceTypeRef.current.contains(event.target as Node)) {
        setOccurrenceTypeOpen(false);
      }
      if (severityRef.current && !severityRef.current.contains(event.target as Node)) {
        setSeverityOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Combine date and time
      const occurrenceDateTime = new Date(`${formData.occurrence_date}T${formData.occurrence_time}`);
      
      // Create the occurrence
      const { data, error } = await supabase
        .from('occurrences')
        .insert({
          title: formData.title,
          occurrence_date: occurrenceDateTime.toISOString(),
          location: formData.location,
          occurrence_type: formData.occurrence_type,
          severity: formData.severity,
          description: formData.description,
          aircraft_id: formData.aircraft_id || null,
          reporter_id: userId,
          weather_conditions: formData.weather_conditions || null,
          flight_phase: formData.flight_phase || null,
          immediate_actions: formData.immediate_actions || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Show success message
      setCurrentStep(totalSteps + 1);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/dashboard/occurrences/${data.id}`);
        router.refresh();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting occurrence:', error);
      setError(error.message || 'An error occurred while submitting the occurrence');
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const getSeverityLabel = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low':
        return <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>Low</span>;
      case 'medium':
        return <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>Medium</span>;
      case 'high':
        return <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>High</span>;
      case 'critical':
        return <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>Critical</span>;
      default:
        return <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>Unknown</span>;
    }
  };
  
  const getOccurrenceTypeIcon = (type: OccurrenceType) => {
    switch (type) {
      case 'incident':
        return <AlertCircle className="h-5 w-5" />;
      case 'accident':
        return <AlertTriangle className="h-5 w-5" />;
      case 'hazard':
        return <ShieldAlert className="h-5 w-5" />;
      case 'observation':
        return <FileText className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  // Get severity color class
  const getSeverityColorClass = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  // Get severity dot color class
  const getSeverityDotClass = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-amber-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      {currentStep <= totalSteps && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center">
                  <div 
                    className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
                      currentStep > index + 1 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : currentStep === index + 1 
                          ? 'border-blue-500 text-blue-500' 
                          : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {currentStep > index + 1 ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span 
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= index + 1 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {index === 0 ? 'Basic Info' : index === 1 ? 'Details' : 'Description'}
                  </span>
                </div>
                
                {index < totalSteps - 1 && (
                  <div 
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > index + 1 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {currentStep > totalSteps && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Report Submitted Successfully</h3>
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            Your occurrence report has been submitted and is being processed. You will be redirected shortly.
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error Submitting Report</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {currentStep <= totalSteps && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Provide the essential details about the occurrence
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors duration-200"
                      placeholder="Brief title describing the occurrence"
                    />
                  </div>
                </div>
                
                {/* Date and Time */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="occurrence_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="occurrence_date"
                        name="occurrence_date"
                        required
                        value={formData.occurrence_date}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors duration-200 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="occurrence_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="occurrence_time"
                        name="occurrence_time"
                        required
                        value={formData.occurrence_time}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors duration-200 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Airport, airspace, or specific location"
                      className="block w-full pl-12 pr-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors duration-200"
                    />
                  </div>
                </div>
                
                {/* Occurrence Type and Severity */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="occurrence_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Occurrence Type <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {getOccurrenceTypeIcon(formData.occurrence_type)}
                      </div>
                      <select
                        id="occurrence_type"
                        name="occurrence_type"
                        required
                        value={formData.occurrence_type}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-12 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none cursor-pointer shadow-sm transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-750"
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                      >
                        <option value="incident" className="py-2">Incident</option>
                        <option value="accident" className="py-2">Accident</option>
                        <option value="hazard" className="py-2">Hazard</option>
                        <option value="observation" className="py-2">Observation</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Severity <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className={`w-5 h-5 rounded-full ${getSeverityDotClass(formData.severity)}`}></div>
                      </div>
                      <select
                        id="severity"
                        name="severity"
                        required
                        value={formData.severity}
                        onChange={handleChange}
                        className={`block w-full pl-12 pr-12 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none cursor-pointer shadow-sm transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-750 font-medium ${getSeverityColorClass(formData.severity)}`}
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                      >
                        <option value="low" className="py-2 text-green-600 dark:text-green-400 font-medium">Low</option>
                        <option value="medium" className="py-2 text-amber-600 dark:text-amber-400 font-medium">Medium</option>
                        <option value="high" className="py-2 text-orange-600 dark:text-orange-400 font-medium">High</option>
                        <option value="critical" className="py-2 text-red-600 dark:text-red-400 font-medium">Critical</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Additional Details</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Provide more context about the occurrence
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Aircraft */}
                <div>
                  <label htmlFor="aircraft_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Aircraft
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Plane className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="aircraft_id"
                      name="aircraft_id"
                      value={formData.aircraft_id}
                      onChange={handleChange}
                      className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select an aircraft (optional)</option>
                      {aircraft.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.registration} - {a.type} {a.model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Weather Conditions */}
                <div>
                  <label htmlFor="weather_conditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weather Conditions
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CloudSun className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="weather_conditions"
                      name="weather_conditions"
                      value={formData.weather_conditions}
                      onChange={handleChange}
                      placeholder="Visibility, cloud cover, wind, etc."
                      className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Flight Phase */}
                <div>
                  <label htmlFor="flight_phase" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Flight Phase
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Compass className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="flight_phase"
                      name="flight_phase"
                      value={formData.flight_phase}
                      onChange={handleChange}
                      placeholder="Taxi, takeoff, cruise, approach, landing, etc."
                      className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Description */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Description</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Provide a detailed account of the occurrence
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={6}
                      required
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide a detailed description of what happened"
                      className="block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors duration-200"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Include all relevant details about the occurrence, including sequence of events, contributing factors, and potential consequences.
                  </p>
                </div>
                
                {/* Immediate Actions */}
                <div>
                  <label htmlFor="immediate_actions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Immediate Actions Taken
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="immediate_actions"
                      name="immediate_actions"
                      rows={4}
                      value={formData.immediate_actions}
                      onChange={handleChange}
                      placeholder="Describe any immediate actions taken to address the situation"
                      className="block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors duration-200"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Describe any actions taken immediately following the occurrence to mitigate risks or prevent further issues.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? () => router.back() : prevStep}
              className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>
            
            <div>
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 