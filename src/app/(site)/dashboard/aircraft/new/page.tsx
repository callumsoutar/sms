import AircraftForm from '../../../../../components/aircraft/AircraftForm';

export const metadata = {
  title: 'Add New Aircraft - Aviation SMS',
  description: 'Add a new aircraft to the safety management system',
};

export default function NewAircraftPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Add New Aircraft
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter the details for the new aircraft
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Aircraft Information</h2>
        </div>
        <div className="px-6 py-5">
          <AircraftForm />
        </div>
      </div>
    </div>
  );
} 