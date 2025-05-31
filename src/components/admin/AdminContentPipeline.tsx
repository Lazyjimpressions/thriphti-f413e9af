
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Settings, RefreshCw, Plus } from "lucide-react";
import { AddSourceModal } from "./content-pipeline/AddSourceModal";
import { SourceList } from "./content-pipeline/SourceList";

// Define the source type
interface ContentSource {
  id: number;
  name: string;
  type: string;
  url: string;
  active: boolean;
  geographic_focus: string;
  keywords: string;
  last_checked: string;
  status: string;
  items_found: number;
  items_processed: number;
}

export default function AdminContentPipeline() {
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sources, setSources] = useState<ContentSource[]>([
    {
      id: 1,
      name: "D Magazine Events Feed",
      type: "rss_feed",
      url: "https://example.com/rss",
      active: true,
      geographic_focus: "Dallas, Deep Ellum",
      keywords: "thrift, vintage, estate sale",
      last_checked: "2024-01-19T10:30:00Z",
      status: "success",
      items_found: 12,
      items_processed: 8
    }
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Placeholder for refresh functionality
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSourceCreated = (newSourceData: Omit<ContentSource, 'id' | 'active' | 'last_checked' | 'status' | 'items_found' | 'items_processed'>) => {
    const newSource: ContentSource = {
      ...newSourceData,
      id: Date.now(), // Simple ID generation for now
      active: true,
      last_checked: new Date().toISOString(),
      status: "success",
      items_found: 0,
      items_processed: 0
    };
    
    setSources(prevSources => [...prevSources, newSource]);
  };

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
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
                <div className="text-2xl font-bold">{sources.filter(s => s.active).length}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {sources.filter(s => s.active).length === 0 ? 'No active sources' : 'Currently processing'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Items Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sources.reduce((total, s) => total + s.items_processed, 0)}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {sources.reduce((total, s) => total + s.items_processed, 0) === 0 ? 'No items processed' : 'Items processed today'}
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
              <SourceList sources={sources} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  Pipeline monitoring will appear here once sources are configured
                </div>
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
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Dallas Area Filtering</h4>
                    <p className="text-sm text-gray-500">Filter content for Dallas-Fort Worth area only</p>
                  </div>
                  <Badge variant="secondary">Not Configured</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Thrift Content Detection</h4>
                    <p className="text-sm text-gray-500">AI detection for thrift-related content</p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
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
