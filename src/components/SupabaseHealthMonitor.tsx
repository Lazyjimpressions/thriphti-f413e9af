
import { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SupabaseHealthMonitorProps {
  onConnectionIssue?: () => void;
}

export function SupabaseHealthMonitor({ onConnectionIssue }: SupabaseHealthMonitorProps) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        console.log('Checking Supabase connection health...');
        const result = await checkSupabaseConnection();
        
        if (!result.success) {
          console.error('Supabase connection issue:', result.error);
          setIsHealthy(false);
          onConnectionIssue?.();
          
          toast({
            title: "Connection Issue",
            description: "Supabase connection problem detected. Please reconnect if needed.",
            variant: "destructive"
          });
        } else {
          if (!isHealthy) {
            console.log('Supabase connection restored');
            toast({
              title: "Connection Restored",
              description: "Supabase connection is working normally"
            });
          }
          setIsHealthy(true);
        }
        
        setLastCheck(new Date());
      } catch (error) {
        console.error('Health check failed:', error);
        setIsHealthy(false);
        onConnectionIssue?.();
      }
    };

    // Initial check
    checkHealth();

    // Check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isHealthy, onConnectionIssue]);

  // This component doesn't render anything visible
  return null;
}

export default SupabaseHealthMonitor;
