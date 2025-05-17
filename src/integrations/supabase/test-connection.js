const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://gqjoebrphojntidztfyd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxam9lYnJwaG9qbnRpZHp0ZnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzUxODIsImV4cCI6MjA2Mjg1MTE4Mn0.WCd3jkNWtFJ1euSGA55cxV0tFm0h2p0fZFDxV7zdCEM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    // Test the connection by getting the current user session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Connection error:', error.message);
      return false;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Session data:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run the test
testConnection(); 