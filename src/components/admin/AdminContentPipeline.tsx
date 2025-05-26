import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Play, RefreshCw, Eye, CheckCircle, XCircle, Clock, Settings, Database } from "lucide-react";

interface ContentPipelineItem {
  id: string;
  stage: string;
  content_type: string;
  raw_data: any;
  processed_data: any;
  ai_metadata: any;
  relevance_score: number;
  status: string;
  created_at: string;
}

interface ContentSource {
  id: string;
  url: string;
  name: string;
  category: string;
  active: boolean;
  last_scraped: string;
  success_rate: number;
  total_attempts: number;
}

export default function AdminContentPipeline() {
  const [pipelineItems, setPipelineItems] = useState<ContentPipelineItem[]>([]);
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(false);
  const [settingUp, setSettingUp] = useState(false);

  useEffect(() => {
    fetchPipelineData();
    fetchSources();
  }, []);

  const fetchPipelineData = async () => {
    try {
      console.log('Fetching content pipeline data...');
      const { data, error } = await supabase
        .from('content_pipeline' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching pipeline data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch content pipeline data",
          variant: "destructive"
        });
        setPipelineItems([]);
      } else {
        console.log(`Fetched ${data?.length || 0} pipeline items`);
        setPipelineItems((data as unknown as ContentPipelineItem[]) || []);
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content pipeline data",
        variant: "destructive"
      });
      setPipelineItems([]);
    }
  };

  const fetchSources = async () => {
    try {
      console.log('Fetching content sources...');
      const { data, error } = await supabase
        .from('content_sources' as any)
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching sources:', error);
        setSources([]);
      } else {
        console.log(`Fetched ${data?.length || 0} content sources`);
        setSources((data as unknown as ContentSource[]) || []);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const setupTestSources = async () => {
    setSettingUp(true);
    try {
      console.log('Setting up test content sources...');
      const { data, error } = await supabase.functions.invoke('setup-test-content-sources');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Test content sources setup completed!"
      });

      // Refresh sources
      await fetchSources();

    } catch (error: any) {
      console.error('Error setting up test sources:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to setup test sources",
        variant: "destructive"
      });
    } finally {
      setSettingUp(false);
    }
  };

  const runContentHarvester = async () => {
    setHarvesting(true);
    try {
      console.log('Running content harvester...');
      const { data, error } = await supabase.functions.invoke('content-harvester');
      
      if (error) {
        console.error('Content harvester error:', error);
        throw error;
      }

      console.log('Content harvester response:', data);

      toast({
        title: "Content Harvester Completed",
        description: `Generated ${data?.articles || 0} articles from ${data?.scraped || 0} sources. Processed ${data?.processed || 0} items.`
      });

      // Refresh data
      await fetchPipelineData();
      await fetchSources();

    } catch (error: any) {
      console.error('Error running content harvester:', error);
      toast({
        title: "Content Harvester Error",
        description: error.message || "Failed to run content harvester. Check the edge function logs for details.",
        variant: "destructive"
      });
    } finally {
      setHarvesting(false);
    }
  };

  const updateItemStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('content_pipeline' as any)
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setPipelineItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );

      toast({
        title: "Success",
        description: `Item ${status}`
      });

    } catch (error: any) {
      console.error('Error updating item status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update item status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      published: { variant: "default", icon: CheckCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading content pipeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Content Pipeline</h2>
        <div className="flex gap-2">
          <Button 
            onClick={setupTestSources}
            variant="outline"
            disabled={settingUp || harvesting}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {settingUp ? 'Setting up...' : 'Setup Test Sources'}
          </Button>
          <Button 
            onClick={fetchPipelineData} 
            variant="outline"
            disabled={harvesting || settingUp}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(harvesting || settingUp) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={runContentHarvester}
            disabled={harvesting || settingUp}
            className="bg-thriphti-green hover:bg-thriphti-green/90"
          >
            <Play className="h-4 w-4 mr-2" />
            {harvesting ? 'Harvesting...' : 'Run AI Harvester'}
          </Button>
        </div>
      </div>

      {sources.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>No content sources found.</strong> Click "Setup Test Sources" to add sample content sources for testing the AI harvester.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineItems.filter(item => item.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sources.filter(source => source.active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Pipeline Items</CardTitle>
        </CardHeader>
        <CardContent>
          {pipelineItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pipeline items found. Run the AI Harvester to generate content.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Relevance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {item.processed_data?.title || item.raw_data?.title || 'Untitled'}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.processed_data?.description || item.raw_data?.description || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.content_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {item.relevance_score ? `${item.relevance_score}/10` : 'N/A'}
                        </div>
                        {item.relevance_score && (
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-thriphti-green h-2 rounded-full" 
                              style={{ width: `${item.relevance_score * 10}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatus(item.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatus(item.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No content sources configured. Click "Setup Test Sources" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Scraped</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {source.url}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{source.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          {Math.round((source.success_rate || 0) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          ({source.total_attempts || 0} attempts)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {source.last_scraped ? 
                        new Date(source.last_scraped).toLocaleDateString() : 
                        'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={source.active ? "default" : "secondary"}>
                        {source.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
