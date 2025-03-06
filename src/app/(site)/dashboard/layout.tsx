import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../../lib/supabase';
import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';

export const metadata = {
  title: 'Aviation Safety Management System',
  description: 'Dashboard for Aviation Safety Management System',
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (!profile) {
    // If profile doesn't exist, create one
    await supabase.from('profiles').insert({
      id: session.user.id,
      email: session.user.email!,
      full_name: session.user.user_metadata.full_name || 'User',
      role: 'reporter', // Default role
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col md:ml-64 min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-8 mx-auto max-w-7xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 