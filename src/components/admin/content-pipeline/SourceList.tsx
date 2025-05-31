
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, ExternalLink, Settings, Trash2, Play, Pause, TestTube, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  toggleContentSourceActive, 
  deleteContentSource, 
  testRSSFeed, 
  triggerSourceProcessing 
} from "@/integrations/supabase/contentQueries";
import { SourceSettingsModal } from "./SourceSettingsModal";
import type { Database as DatabaseType } from "@/integrations/supabase/types";

// Use the database type directly
type ContentSource = DatabaseType['public']['Tables']['content_sources']['Row'];

interface SourceListProps {
  sources: ContentSource[];
  onSourceUpdated: () => void;
}

export function SourceList({ sources, onSourceUpdated }: SourceListProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [settingsSource, setSettingsSource] = useState<ContentSource | null>(null);
  const { toast } = useToast();

  const setLoading = (sourceId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [sourceId]: loading }));
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'rss': return 'RSS Feed';
      case 'email': return 'Email Alert';
      case 'api': return 'API';
      case 'web_scrape': return 'Web Scrape';
      default: return type;
    }
  };

  const getStatusBadge = (source: ContentSource) => {
    if (!source.active) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    
    if (source.consecutive_failures && source.consecutive_failures > 0) {
      return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
    
    if (source.success_rate && source.success_rate > 0.8) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const handleToggleActive = async (sourceId: string) => {
    setLoading(sourceId, true);
    try {
      await toggleContentSourceActive(sourceId);
      toast({
        title: "Source Updated",
        description: "Source status has been updated successfully.",
      });
      onSourceUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update source status",
        variant: "destructive",
      });
    } finally {
      setLoading(sourceId, false);
    }
  };

  const handleDelete = async (sourceId: string, sourceName: string) => {
    if (!confirm(`Are you sure you want to delete "${sourceName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(sourceId, true);
    try {
      await deleteContentSource(sourceId);
      toast({
        title: "Source Deleted",
        description: `"${sourceName}" has been deleted successfully.`,
      });
      onSourceUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete source",
        variant: "destructive",
      });
    } finally {
      setLoading(sourceId, false);
    }
  };

  const handleTestFeed = async (sourceId: string, url: string) => {
    setLoading(sourceId, true);
    try {
      const result = await testRSSFeed(url);
      
      if (result.isValid) {
        toast({
          title: "Feed Test Successful",
          description: `Found ${result.itemCount} items in "${result.title}"`,
        });
      } else {
        toast({
          title: "Feed Test Failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test feed",
        variant: "destructive",
      });
    } finally {
      setLoading(sourceId, false);
    }
  };

  const handleRefreshSource = async (sourceId: string) => {
    setLoading(sourceId, true);
    try {
      await triggerSourceProcessing(sourceId);
      toast({
        title: "Processing Triggered",
        description: "Source processing has been triggered successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger processing",
        variant: "destructive",
      });
    } finally {
      setLoading(sourceId, false);
    }
  };

  const handleSettings = (source: ContentSource) => {
    setSettingsSource(source);
  };

  if (sources.length === 0) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Sources</h3>
        <p className="text-gray-500 mb-4">
          Get started by adding your first content source to begin processing Dallas thrifting content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <Card key={source.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{source.name}</h3>
                  {getStatusBadge(source)}
                  <Badge variant="outline">{getSourceTypeLabel(source.source_type)}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">
                      <strong>URL:</strong> 
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {source.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Geographic Focus:</strong> {source.geographic_focus || 'Not specified'}
                    </p>
                    <p className="text-gray-600">
                      <strong>Keywords:</strong> {source.keywords?.join(', ') || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-1">
                      <strong>Last Scraped:</strong> {source.last_scraped ? new Date(source.last_scraped).toLocaleString() : 'Never'}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Success Rate:</strong> {Math.round((Number(source.success_rate) || 0) * 100)}%
                    </p>
                    {source.last_error_message && (
                      <p className="text-red-600 text-xs">
                        <strong>Last Error:</strong> {source.last_error_message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleActive(source.id)}
                  disabled={loadingStates[source.id]}
                  title={source.active ? "Pause Source" : "Activate Source"}
                >
                  {source.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                {source.source_type === 'rss' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestFeed(source.id, source.url)}
                    disabled={loadingStates[source.id]}
                    title="Test RSS Feed"
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRefreshSource(source.id)}
                  disabled={loadingStates[source.id]}
                  title="Trigger Processing"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingStates[source.id] ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSettings(source)}
                  title="Edit Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(source.id, source.name)}
                  disabled={loadingStates[source.id]}
                  title="Delete Source"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <SourceSettingsModal
        source={settingsSource}
        open={!!settingsSource}
        onOpenChange={(open) => !open && setSettingsSource(null)}
        onSourceUpdated={onSourceUpdated}
      />
    </div>
  );
}
