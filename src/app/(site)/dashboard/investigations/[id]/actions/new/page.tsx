import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../../../../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import AddCorrectiveAction from '../../../../../../../components/investigations/AddCorrectiveAction';

export const metadata = {
  title: 'Add Corrective Action - Aviation SMS',
  description: 'Add a new corrective action to an investigation',
};

export default async function NewCorrectiveActionPage({
  params,
}: {
  params: { id: string };
}) {
  // Verify that the investigation exists
  const { data: investigation, error } = await supabase
    .from('investigations')
    .select('id, occurrence_id, stage')
    .eq('id', params.id)
    .single();
  
  if (error || !investigation) {
    console.error('Error fetching investigation:', error);
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link 
          href={`/dashboard/investigations/${params.id}`} 
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Investigation
        </Link>
      </div>
      
      <AddCorrectiveAction investigationId={params.id} />
    </div>
  );
} 