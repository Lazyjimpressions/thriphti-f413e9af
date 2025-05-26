
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SourceHealth {
  id: string;
  name: string;
  source_type: string;
  success_rate: number;
  consecutive_failures: number;
  last_scraped: string;
  last_error_message: string;
  total_attempts: number;
  successful_attempts: number;
  active: boolean;
}

export default function SourceHealthMonitor() {
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSourceHealth();
  }, []);

  const fetchSourceHealth = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sources')
        .select('id, name, source_type, success_rate, consecutive_failures, last_scraped, last_error_message, total_attempts, successful_attempts, active')
        .order('consecutive_failures', { ascending: false });

      if (error) throw error;

      setSources(data || []);
    } catch (error) {
      console.error('Error fetching source health:', error);
      toast({
        title: "Error",
        description: "Failed to fetch source health data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshHealth = async () => {
    setRefreshing(true);
    await fetchSourceHealth();
    setRefreshing(false);
  };

  const resetSourceErrors = async (sourceId: string) => {
    try {
      const { error } = await supabase
        .from('content_sources')
        .update({ 
          consecutive_failures: 0, 
          last_error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Source errors cleared"
      });

      await fetchSourceHealth();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset source errors",
        variant: "destructive"
      });
    }
  };

  const getHealthStatus = (source: SourceHealth) => {
    if (!source.active) return { status: 'inactive', color: 'gray', icon: XCircle };
    if (source.consecutive_failures >= 3) return { status: 'critical', color: 'red', icon: XCircle };
    if (source.consecutive_failures > 0) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    if (source.success_rate >= 0.8) return { status: 'healthy', color: 'green', icon: CheckCircle };
    if (source.success_rate >= 0.5) return { status: 'degraded', color: 'yellow', icon: AlertTriangle };
    return { status: 'poor', color: 'red', icon: XCircle };
  };

  const getSuccessRateTrend = (successRate: number) => {
    if (successRate >= 0.8) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (successRate >= 0.5) return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const criticalSources = sources.filter(s => s.consecutive_failures >= 3 && s.active);
  const warningSources = sources.filter(s => s.consecutive_failures > 0 && s.consecutive_failures < 3 && s.active);
  const healthySources = sources.filter(s => s.consecutive_failures === 0 && s.active);
  const inactiveSources = sources.filter(s => !s.active);

  if (loading) {
    return <div>Loading source health data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Source Health Monitor</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshHealth}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthySources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-600">Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningSources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalSources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveSources.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Sources Alert */}
      {criticalSources.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Critical Sources Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalSources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <div className="font-medium">{source.name}</div>
                    <div className="text-sm text-gray-500">
                      {source.consecutive_failures} consecutive failures
                    </div>
                    {source.last_error_message && (
                      <div className="text-sm text-red-600 mt-1">
                        {source.last_error_message.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetSourceErrors(source.id)}
                  >
                    Reset
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Source Health */}
      <Card>
        <CardHeader>
          <CardTitle>Source Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sources.map(source => {
              const health = getHealthStatus(source);
              const HealthIcon = health.icon;
              
              return (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <HealthIcon className={`h-5 w-5 text-${health.color}-500`} />
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {source.source_type}
                        </Badge>
                        <span>•</span>
                        <span>
                          {source.successful_attempts}/{source.total_attempts} successful
                        </span>
                        {source.last_scraped && (
                          <>
                            <span>•</span>
                            <span>
                              Last: {new Date(source.last_scraped).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {Math.round((source.success_rate || 0) * 100)}%
                        </span>
                        {getSuccessRateTrend(source.success_rate || 0)}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            source.success_rate >= 0.8 ? 'bg-green-500' : 
                            source.success_rate >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(source.success_rate || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {source.consecutive_failures > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {source.consecutive_failures} failures
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
