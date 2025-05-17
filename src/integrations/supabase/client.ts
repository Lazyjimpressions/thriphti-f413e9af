/**
 * Supabase client configuration
 * This file sets up the Supabase client with proper type safety and environment variables
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Environment variables for Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * Supabase client instance with type safety
 * Usage:
 * import { supabase } from "@/integrations/supabase/client";
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);