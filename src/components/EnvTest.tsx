import { useEffect, useState } from 'react';

export function EnvTest() {
  const [envStatus, setEnvStatus] = useState<{
    url: string | undefined;
    key: string | undefined;
  }>({ url: undefined, key: undefined });

  useEffect(() => {
    setEnvStatus({
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
    console.log('EnvTest component rendered');
  }, []);

  return (
    <div style={{ border: '5px solid red', zIndex: 9999, background: 'white' }} className="p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
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
      </div>
    </div>
  );
} 