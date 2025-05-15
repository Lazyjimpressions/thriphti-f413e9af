
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  // Your Supabase URL and anon key are already set in the environment variables
  // from the Lovable-Supabase connection
  "https://gqjoebrphojntidztfyd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxam9lYnJwaG9qbnRpZHp0ZnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzUxODIsImV4cCI6MjA2Mjg1MTE4Mn0.WCd3jkNWtFJ1euSGA55cxV0tFm0h2p0fZFDxV7zdCEM",
  {
    auth: {
      persistSession: true,
      storage: localStorage,
      autoRefreshToken: true,
    }
  }
);
