import { createServerSupabaseClient } from '../../../../../lib/supabase';
import OccurrenceForm from '../../../../../components/occurrences/OccurrenceForm';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Report New Occurrence - Aviation SMS',
  description: 'Report a new safety occurrence',
};

export default async function NewOccurrencePage() {
  const supabase = await createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }
  
  // Get aircraft list for the form
  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('id, registration, type, model')
    .order('registration');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report New Occurrence</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Use this form to report any safety occurrence, incident, accident, hazard, or observation.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <OccurrenceForm aircraft={aircraft || []} userId={session.user.id} />
      </div>
    </div>
  );
} 