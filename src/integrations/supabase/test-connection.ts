import { supabase } from './client';

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