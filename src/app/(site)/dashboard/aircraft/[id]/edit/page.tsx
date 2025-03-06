import { notFound } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabase';
import AircraftForm from '../../../../../../components/aircraft/AircraftForm';
import { Aircraft } from '../../../../../../types/schema';

export const metadata = {
  title: 'Edit Aircraft - Aviation SMS',
  description: 'Edit aircraft details in the safety management system',
};

export default async function EditAircraftPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch aircraft details
  const { data: aircraft, error } = await supabase
    .from('aircraft')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !aircraft) {
    console.error('Error fetching aircraft:', error);
    notFound();
  }

  // Cast to proper type
  const typedAircraft = aircraft as unknown as Aircraft;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Edit Aircraft: {typedAircraft.registration}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Update the details for this aircraft
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Aircraft Information</h2>
        </div>
        <div className="px-6 py-5">
          <AircraftForm aircraft={typedAircraft} />
        </div>
      </div>
    </div>
  );
} 