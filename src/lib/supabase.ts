import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/database';

// Client-side Supabase client (for use in Client Components)
export const supabase = createClientComponentClient<Database>();

// Server-side Supabase client (for use in Server Components and API routes)
export const createServerSupabaseClient = async () => {
  const { cookies } = await import('next/headers');
  return createServerComponentClient<Database>({ cookies });
}; 