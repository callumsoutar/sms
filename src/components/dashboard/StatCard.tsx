'use client';

import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  AlertOctagon,
  TrendingUp,
  Users,
  Plane,
  Calendar
} from 'lucide-react';
import { formatDateOnly } from '../../lib/utils';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

const iconMap = {
  'AlertTriangle': AlertTriangle,
  'CheckCircle': CheckCircle,
  'Clock': Clock,
  'AlertOctagon': AlertOctagon,
  'TrendingUp': TrendingUp,
  'Users': Users,
  'Plane': Plane,
  'Calendar': Calendar
};

export default function StatCard({ title, value, description, iconName, trend }: StatCardProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap];
  const [dateString, setDateString] = useState<string>('');
  
  // Use useEffect to set the date on the client side only
  useEffect(() => {
    setDateString(formatDateOnly(new Date().toISOString()));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            
            {trend && (
              <div className="mt-2 flex items-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  trend.positive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  <svg 
                    className={`-ml-0.5 mr-1 h-3 w-3 ${trend.positive ? 'text-green-500' : 'text-red-500'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={trend.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} 
                    />
                  </svg>
                  {trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>
          
          <div className="rounded-full p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {Icon && <Icon className="h-6 w-6" />}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {dateString ? `Last updated: ${dateString}` : 'Last updated: Recently'}
        </div>
      </div>
    </div>
  );
} 