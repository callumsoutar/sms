'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function OccurrenceChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      
      // Get the date 6 months ago
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      // Fetch occurrences grouped by month and severity
      const { data, error } = await supabase
        .from('occurrences')
        .select('created_at, severity')
        .gte('created_at', sixMonthsAgo.toISOString());
      
      if (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
        return;
      }
      
      // Process data for chart
      const months: Record<string, { high: number; medium: number; low: number }> = {};
      
      // Initialize months
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[monthKey] = { high: 0, medium: 0, low: 0 };
      }
      
      // Count occurrences by month and severity
      data?.forEach(occurrence => {
        const date = new Date(occurrence.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (months[monthKey]) {
          const severity = (occurrence.severity || 'low').toLowerCase();
          if (severity === 'high') months[monthKey].high++;
          else if (severity === 'medium') months[monthKey].medium++;
          else months[monthKey].low++;
        }
      });
      
      // Convert to chart format
      const chartData = {
        labels: Object.keys(months)
          .sort()
          .map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short' });
          }),
        datasets: [
          {
            label: 'High',
            data: Object.keys(months)
              .sort()
              .map(month => months[month].high),
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgb(239, 68, 68)',
          },
          {
            label: 'Medium',
            data: Object.keys(months)
              .sort()
              .map(month => months[month].medium),
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: 'rgb(245, 158, 11)',
          },
          {
            label: 'Low',
            data: Object.keys(months)
              .sort()
              .map(month => months[month].low),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
          },
        ],
      };
      
      setChartData(chartData);
      setLoading(false);
    };
    
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Since we can't use Chart.js directly in this environment, we'll create a visual representation
  return (
    <div className="h-64">
      {chartData ? (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-end">
            {chartData.labels.map((label: string, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full px-1 flex flex-col-reverse space-y-reverse space-y-1">
                  <div 
                    className="w-full bg-red-500 rounded-t"
                    style={{ height: `${chartData.datasets[0].data[index] * 10}px` }}
                    title={`High: ${chartData.datasets[0].data[index]}`}
                  ></div>
                  <div 
                    className="w-full bg-amber-500 rounded-t"
                    style={{ height: `${chartData.datasets[1].data[index] * 10}px` }}
                    title={`Medium: ${chartData.datasets[1].data[index]}`}
                  ></div>
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${chartData.datasets[2].data[index] * 10}px` }}
                    title={`Low: ${chartData.datasets[2].data[index]}`}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{label}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">High</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded mr-1"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Low</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
} 