'use client';

import { useState, useEffect } from 'react';
import { Truck, Fuel, Droplet, AlertTriangle, CheckCircle2, Info, MapPin, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

// Define trailer types
interface Trailer {
  id: string;
  name: string;
  maxCapacity: number;
  currentFuel: number;
  lastRefilled: string;
  status: 'available' | 'in-use' | 'maintenance';
  location: string;
  color: string;
}

export default function TrailerManagement() {
  // Sample trailer data
  const initialTrailers: Trailer[] = [
    {
      id: 'trailer-1',
      name: 'Jet-A1 Refueler',
      maxCapacity: 2000,
      currentFuel: 1250,
      lastRefilled: '2023-03-05T08:30:00Z',
      status: 'available',
      location: 'Main Hangar',
      color: '#3B82F6' // blue
    },
    {
      id: 'trailer-2',
      name: 'AVGAS Refueler',
      maxCapacity: 1500,
      currentFuel: 750,
      lastRefilled: '2023-03-04T14:15:00Z',
      status: 'available',
      location: 'East Apron',
      color: '#EF4444' // red
    }
  ];

  const [trailers, setTrailers] = useState<Trailer[]>(initialTrailers);
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer>(initialTrailers[0]);
  const [fuelInput, setFuelInput] = useState<string>(initialTrailers[0].currentFuel.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Update fuel input when selected trailer changes
  useEffect(() => {
    setFuelInput(selectedTrailer.currentFuel.toString());
    setIsEditing(false);
  }, [selectedTrailer]);

  // Handle trailer selection
  const handleTrailerSelect = (trailerId: string) => {
    const trailer = trailers.find(t => t.id === trailerId);
    if (trailer) {
      setSelectedTrailer(trailer);
    }
  };

  // Handle fuel level update
  const handleFuelUpdate = () => {
    const fuelValue = parseInt(fuelInput);
    
    // Validate input
    if (isNaN(fuelValue)) {
      setNotification({ type: 'error', message: 'Please enter a valid number' });
      return;
    }
    
    if (fuelValue < 0) {
      setNotification({ type: 'error', message: 'Fuel level cannot be negative' });
      return;
    }
    
    if (fuelValue > selectedTrailer.maxCapacity) {
      setNotification({ type: 'error', message: `Maximum capacity is ${selectedTrailer.maxCapacity}L` });
      return;
    }
    
    // Update the trailer's fuel level
    const updatedTrailers = trailers.map(trailer => 
      trailer.id === selectedTrailer.id 
        ? { ...trailer, currentFuel: fuelValue, lastRefilled: new Date().toISOString() }
        : trailer
    );
    
    setTrailers(updatedTrailers);
    setSelectedTrailer({ ...selectedTrailer, currentFuel: fuelValue, lastRefilled: new Date().toISOString() });
    setIsEditing(false);
    setNotification({ type: 'success', message: 'Fuel level updated successfully' });
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Calculate fuel percentage
  const getFuelPercentage = (current: number, max: number) => {
    return Math.min(Math.round((current / max) * 100), 100);
  };

  // Get color based on fuel level
  const getFuelLevelColor = (percentage: number) => {
    if (percentage <= 20) return 'text-red-500';
    if (percentage <= 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  // Get background color based on fuel level
  const getFuelLevelBgColor = (percentage: number) => {
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'in-use':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
    }
  };

  const fuelPercentage = getFuelPercentage(selectedTrailer.currentFuel, selectedTrailer.maxCapacity);
  
  // Adjust fuel level by a specific amount
  const adjustFuelLevel = (amount: number) => {
    const newValue = Math.max(0, Math.min(selectedTrailer.maxCapacity, parseInt(fuelInput) + amount));
    setFuelInput(newValue.toString());
    setIsEditing(true);
  };

  return (
    <div className="space-y-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md rounded-lg p-4 shadow-lg flex items-start space-x-3 transform transition-all duration-300 ease-out ${
          notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' :
          notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex-shrink-0">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            ) : notification.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            ) : (
              <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            )}
          </div>
          <p className={`text-sm ${
            notification.type === 'success' ? 'text-emerald-700 dark:text-emerald-300' :
            notification.type === 'error' ? 'text-red-700 dark:text-red-300' :
            'text-blue-700 dark:text-blue-300'
          }`}>
            {notification.message}
          </p>
        </div>
      )}

      {/* Trailer Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Truck className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
            Select Trailer
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trailers.map((trailer) => (
              <div 
                key={trailer.id}
                onClick={() => handleTrailerSelect(trailer.id)}
                className={`cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden ${
                  selectedTrailer.id === trailer.id 
                    ? 'border-2 border-blue-500 dark:border-blue-400 shadow-md' 
                    : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center p-4">
                  <div 
                    className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: `${trailer.color}20` }}
                  >
                    <Truck className="h-6 w-6" style={{ color: trailer.color }} />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{trailer.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trailer.status)}`}>
                        {trailer.status.replace('-', ' ')}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {trailer.location}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="relative h-10 w-10 flex items-center justify-center">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle
                          className="text-gray-200 dark:text-gray-700"
                          strokeWidth="5"
                          stroke="currentColor"
                          fill="transparent"
                          r="18"
                          cx="20"
                          cy="20"
                        />
                        <circle
                          className={getFuelLevelColor(getFuelPercentage(trailer.currentFuel, trailer.maxCapacity))}
                          strokeWidth="5"
                          strokeDasharray={`${2 * Math.PI * 18 * getFuelPercentage(trailer.currentFuel, trailer.maxCapacity) / 100} ${2 * Math.PI * 18}`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="18"
                          cx="20"
                          cy="20"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Droplet className={`h-4 w-4 ${getFuelLevelColor(getFuelPercentage(trailer.currentFuel, trailer.maxCapacity))}`} />
                      </div>
                    </div>
                  </div>
                </div>
                {selectedTrailer.id === trailer.id && (
                  <div className="h-1 bg-blue-500 dark:bg-blue-400"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trailer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fuel Tank Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden lg:col-span-1">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Fuel className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Fuel Tank
            </h2>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedTrailer.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedTrailer.status)}`}>
                {selectedTrailer.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="relative w-full max-w-xs h-80 flex items-center justify-center my-6">
              {/* Fuel Tank Visualization */}
              <div className="relative w-40 h-64 rounded-lg overflow-hidden border-4 border-gray-300 dark:border-gray-600 shadow-inner">
                {/* Fuel level background */}
                <div 
                  className="absolute bottom-0 left-0 right-0 w-full transition-all duration-700 ease-in-out" 
                  style={{ 
                    height: `${fuelPercentage}%`, 
                    background: `linear-gradient(to bottom, ${selectedTrailer.color}99, ${selectedTrailer.color})`
                  }}
                >
                  {/* Animated wave effect */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 animate-wave" 
                      style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-31.8z' fill='%23ffffff'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat-x',
                        backgroundSize: '800px 100px',
                        height: '100px',
                        width: '800px'
                      }}
                    />
                  </div>
                </div>
                
                {/* Fuel level markers */}
                <div className="absolute inset-y-0 right-0 w-6 flex flex-col justify-between py-2 px-1">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">100%</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">75%</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">50%</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">25%</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">0%</div>
                </div>
                
                {/* Fuel level lines */}
                <div className="absolute inset-x-0 top-0 border-b border-gray-300 dark:border-gray-600" style={{ top: '0%' }}></div>
                <div className="absolute inset-x-0 top-0 border-b border-gray-300 dark:border-gray-600" style={{ top: '25%' }}></div>
                <div className="absolute inset-x-0 top-0 border-b border-gray-300 dark:border-gray-600" style={{ top: '50%' }}></div>
                <div className="absolute inset-x-0 top-0 border-b border-gray-300 dark:border-gray-600" style={{ top: '75%' }}></div>
                
                {/* Fuel cap */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-gray-400 dark:bg-gray-500 rounded-t-lg"></div>
              </div>
              
              {/* Fuel percentage indicator */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                <div className="flex items-baseline justify-center">
                  <Droplet className={`h-5 w-5 mr-1 ${getFuelLevelColor(fuelPercentage)}`} />
                  <span className={`text-2xl font-bold ${getFuelLevelColor(fuelPercentage)}`}>
                    {fuelPercentage}%
                  </span>
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                    ({selectedTrailer.currentFuel}L)
                  </span>
                </div>
              </div>
            </div>
            
            {/* Fuel capacity info */}
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Capacity</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedTrailer.maxCapacity}L</p>
            </div>
          </div>
        </div>
        
        {/* Trailer Info and Controls */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trailer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Info className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                Trailer Information
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{selectedTrailer.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Refilled</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{formatDate(selectedTrailer.lastRefilled)}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <Droplet className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Fuel Level</p>
                    <div className="flex items-center">
                      <p className="text-base font-medium text-gray-900 dark:text-white">{selectedTrailer.currentFuel}L</p>
                      <div className="ml-2 w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getFuelLevelBgColor(fuelPercentage)}`} 
                          style={{ width: `${fuelPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Fuel Level Control */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Fuel className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                Update Fuel Level
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Numeric Input with Increment/Decrement */}
                <div>
                  <label htmlFor="fuel-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fuel Level (Liters)
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => adjustFuelLevel(-100)}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <span className="sr-only">Decrease</span>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      name="fuel-level"
                      id="fuel-level"
                      className="block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter fuel level"
                      value={fuelInput}
                      onChange={(e) => {
                        setFuelInput(e.target.value);
                        setIsEditing(true);
                      }}
                      min="0"
                      max={selectedTrailer.maxCapacity}
                    />
                    <div className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                      <span className="text-sm">Liters</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => adjustFuelLevel(100)}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <span className="sr-only">Increase</span>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Vertical Range Slider */}
                <div className="flex items-center justify-center">
                  <div className="h-48 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={selectedTrailer.maxCapacity}
                      value={fuelInput}
                      onChange={(e) => {
                        setFuelInput(e.target.value);
                        setIsEditing(true);
                      }}
                      className="h-full w-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer orient-vertical"
                      style={{ 
                        writingMode: 'vertical-lr' as const,
                        WebkitAppearance: 'slider-vertical',
                        width: '24px',
                        height: '100%',
                        accentColor: selectedTrailer.color
                      }}
                    />
                  </div>
                  <div className="ml-4 h-48 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>{selectedTrailer.maxCapacity}L</span>
                    <span>{Math.round(selectedTrailer.maxCapacity * 0.75)}L</span>
                    <span>{Math.round(selectedTrailer.maxCapacity / 2)}L</span>
                    <span>{Math.round(selectedTrailer.maxCapacity * 0.25)}L</span>
                    <span>0L</span>
                  </div>
                </div>
                
                {/* Update Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleFuelUpdate}
                    disabled={!isEditing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Update Fuel Level
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 