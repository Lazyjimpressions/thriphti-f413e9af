
/**
 * Supabase client configuration
 * This file sets up the Supabase client with proper type safety and hardcoded values
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Hardcoded Supabase configuration values for both Lovable and Cursor environments
const SUPABASE_URL = 'https://olmlcbsveidqoxabfnkm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbWxjYnN2ZWlkcW94YWJmbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4OTk3OTcsImV4cCI6MjAyOTQ3NTc5N30.0jXqEUNvnF5YYYU6zcvqBlxJy-0hM2rqHsYmDdbezGM';

// Check if Supabase URL is available (optional but helpful for debugging)
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing Supabase configuration values. Please check client.ts file.');
  throw new Error('Missing Supabase configuration values. Please check client.ts file.');
}

console.log('Initializing Supabase client with URL:', SUPABASE_URL);

/**
 * Supabase client instance with type safety
 * Usage:
 * import { supabase } from "@/integrations/supabase/client";
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Log when the client is initialized
console.log('Supabase client initialization complete');

// Export a function to check client health
export function checkSupabaseConnection(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      // Use the Promise returned by the Supabase query
      supabase.from('articles')
        .select('count', { count: 'exact', head: true })
        .then(response => {
          console.log('Supabase connection check response:', response);
          resolve(!response.error);
        })
        .catch(error => {
          console.error('Supabase connection check failed:', error);
          resolve(false);
        });
    } catch (error) {
      console.error('Unexpected error during Supabase connection check:', error);
      resolve(false);
    }
  });
}
