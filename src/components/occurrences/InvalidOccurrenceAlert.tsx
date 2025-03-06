import { AlertTriangle } from 'lucide-react';

interface InvalidOccurrenceAlertProps {
  invalidReason: string;
}

export default function InvalidOccurrenceAlert({ invalidReason }: InvalidOccurrenceAlertProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
            This occurrence has been marked as invalid
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-400">
            <p>{invalidReason || 'No reason provided.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 