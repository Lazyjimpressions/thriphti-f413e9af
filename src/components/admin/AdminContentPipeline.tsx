
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Settings, RefreshCw, Plus } from "lucide-react";
import { AddSourceModal } from "./content-pipeline/AddSourceModal";
import { SourceList } from "./content-pipeline/SourceList";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  getContentSources, 
  getContentPipelineStats,
  createContentSource 
} from "@/integrations/supabase/contentQueries";

// Define the source type to match the database
interface ContentSource {
  id: string;
  name: string;
  source_type: string;
  url: string;
  active: boolean;
  geographic_focus: string | null;
  keywords: string[] | null;
  last_scraped: string | null;
  success_rate: number;
  last_error_message: string | null;
  consecutive_failures: number;
}

export default function AdminContentPipeline() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  // Fetch content sources
  const { 
    data: sources = [], 
    isLoading: sourcesLoading, 
    refetch: refetchSources 
  } = useQuery({
    queryKey: ['content-sources'],
    queryFn: getContentSources,
  });

  // Fetch pipeline statistics
  const { 
    data: pipelineStats = { total: 0, pending: 0, processed: 0, published: 0 },
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['content-pipeline-stats'],
    queryFn: getContentPipelineStats,
  });

  const handleRefresh = () => {
    refetchSources();
    refetchStats();
    toast({
      title: "Refreshed",
      description: "Content sources and pipeline data have been refreshed.",
    });
  };

  const handleSourceCreated = async (newSourceData: Omit<ContentSource, 'id' | 'active' | 'last_scraped' | 'success_rate' | 'last_error_message' | 'consecutive_failures'>) => {
    try {
      await createContentSource({
        ...newSourceData,
        active: true,
        success_rate: 1.0,
        consecutive_failures: 0,
      });
      
      toast({
        title: "Source Created",
        description: `"${newSourceData.name}" has been added successfully.`,
      });
      
      refetchSources();
      setShowAddModal(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create source",
        variant: "destructive",
      });
    }
  };

  const activeSources = sources.filter(s => s.active).length;
  const totalProcessedToday = pipelineStats.published;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Pipeline Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor your content sources and processing pipeline
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={sourcesLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${sourcesLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources">Content Sources</TabsTrigger>
          <TabsTrigger value="pipeline">Processing Pipeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sources.length}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {sources.length === 0 ? 'No sources configured' : `${sources.length} source${sources.length === 1 ? '' : 's'} configured`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Active Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSources}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {activeSources === 0 ? 'No active sources' : 'Currently processing'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Items Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProcessedToday}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {totalProcessedToday === 0 ? 'No items published' : 'Total published items'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Content Sources
                </CardTitle>
                <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sourcesLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading sources...</p>
                </div>
              ) : (
                <SourceList sources={sources} onSourceUpdated={refetchSources} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pipelineStats.total}</div>
                <p className="text-sm text-gray-500 mt-1">In pipeline</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pipelineStats.pending}</div>
                <p className="text-sm text-gray-500 mt-1">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{pipelineStats.processed}</div>
                <p className="text-sm text-gray-500 mt-1">Ready for review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{pipelineStats.published}</div>
                <p className="text-sm text-gray-500 mt-1">Live on site</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  Pipeline monitoring dashboard coming soon
                </div>
                <p className="text-sm text-gray-500">
                  View real-time content processing status and manage review queue
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Processing Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto Processing</h4>
                    <p className="text-sm text-gray-500">Automatically process new content with AI</p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Dallas Area Filtering</h4>
                    <p className="text-sm text-gray-500">Filter content for Dallas-Fort Worth area only</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Thrift Content Detection</h4>
                    <p className="text-sm text-gray-500">AI detection for thrift-related content</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddSourceModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onSourceCreated={handleSourceCreated}
      />
    </div>
  );
}
