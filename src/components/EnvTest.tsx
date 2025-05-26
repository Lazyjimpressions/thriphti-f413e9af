
import { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

export function EnvTest() {
  const [envStatus, setEnvStatus] = useState<{
    url: string | undefined;
    key: string | undefined;
    connectionHealthy: boolean | null;
  }>({ url: undefined, key: undefined, connectionHealthy: null });

  useEffect(() => {
    const checkEnvironment = async () => {
      console.log('EnvTest component rendered - checking environment and connection');
      
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Check connection health
      const connectionResult = await checkSupabaseConnection();
      
      setEnvStatus({
        url,
        key,
        connectionHealthy: connectionResult.success
      });
    };

    checkEnvironment();
  }, []);

  return (
    <div style={{ border: '5px solid red', zIndex: 9999, background: 'white' }} className="p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Variables & Connection Test</h1>
      <div className="space-y-2">
        {!envStatus.url || !envStatus.key ? (
          <>
            <p className="text-red-500">Error: Environment variables not loaded!</p>
            <p>SUPABASE_URL: {envStatus.url ? '✅' : '❌'}</p>
            <p>SUPABASE_KEY: {envStatus.key ? '✅' : '❌'}</p>
          </>
        ) : (
          <>
            <p className="text-green-500">Environment variables loaded successfully!</p>
            <p>SUPABASE_URL: {envStatus.url}</p>
            <p>SUPABASE_KEY: {envStatus.key.substring(0, 10)}...</p>
          </>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <h2 className="text-lg font-semibold mb-2">Connection Health</h2>
          {envStatus.connectionHealthy === null ? (
            <p className="text-yellow-500">⏳ Checking connection...</p>
          ) : envStatus.connectionHealthy ? (
            <p className="text-green-500">✅ Supabase connection healthy</p>
          ) : (
            <p className="text-red-500">❌ Supabase connection issue detected</p>
          )}
        </div>
      </div>
    </div>
  );
} 
