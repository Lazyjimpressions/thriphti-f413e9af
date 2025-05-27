import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Play, RefreshCw, Eye, CheckCircle, XCircle, Clock, Settings, Database, AlertTriangle, Zap, Calendar, Globe, Mail, Rss, Trash2 } from "lucide-react";
import SupabaseHealthMonitor from "@/components/SupabaseHealthMonitor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentSourceManager from "./ContentSourceManager";
import SourceHealthMonitor from "./SourceHealthMonitor";
import RssSetupWizard from "./rss/RssSetupWizard";

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
  source_type: string;
  active: boolean;
  last_scraped: string;
  success_rate: number;
  total_attempts: number;
  successful_attempts: number;
  scrape_config: any;
  schedule: string;
  priority: number;
  neighborhoods: string[];
  keywords: string[];
  last_error_message: string;
  consecutive_failures: number;
  max_retries: number;
}

export default function AdminContentPipeline() {
  const [pipelineItems, setPipelineItems] = useState<ContentPipelineItem[]>([]);
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ContentSource | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterSourceType, setFilterSourceType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deletingSource, setDeletingSource] = useState<string | null>(null);

  useEffect(() => {
    fetchPipelineData();
    fetchSources();
  }, []);

  const handleConnectionIssue = () => {
    console.log('Connection issue detected in AdminContentPipeline');
    setConnectionIssue(true);
    setTimeout(() => {
      setConnectionIssue(false);
      fetchPipelineData();
      fetchSources();
    }, 3000);
  };

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
        .order('priority', { ascending: false });
      
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

  const toggleSourceActive = async (sourceId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('content_sources')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', sourceId);

      if (error) throw error;

      setSources(prev => 
        prev.map(source => 
          source.id === sourceId ? { ...source, active } : source
        )
      );

      toast({
        title: "Success",
        description: `Source ${active ? 'activated' : 'deactivated'}`
      });

    } catch (error: any) {
      console.error('Error updating source status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update source status",
        variant: "destructive"
      });
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

  const getSourceTypeIcon = (sourceType: string) => {
    const icons = {
      rss: Rss,
      web_scrape: Globe,
      email: Mail,
      api: Zap,
      calendar: Calendar
    };
    const IconComponent = icons[sourceType as keyof typeof icons] || Globe;
    return <IconComponent className="h-4 w-4" />;
  };

  const getSourceTypeColor = (sourceType: string) => {
    const colors = {
      rss: 'bg-blue-100 text-blue-800',
      web_scrape: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      api: 'bg-yellow-100 text-yellow-800',
      calendar: 'bg-red-100 text-red-800'
    };
    return colors[sourceType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800';
    if (priority >= 6) return 'bg-yellow-100 text-yellow-800';
    if (priority >= 4) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const deleteSource = async (sourceId: string, sourceName: string) => {
    setDeletingSource(sourceId);
    try {
      const { error } = await supabase
        .from('content_sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;

      setSources(prev => prev.filter(source => source.id !== sourceId));

      toast({
        title: "Source Deleted",
        description: `"${sourceName}" has been permanently deleted`
      });

    } catch (error: any) {
      console.error('Error deleting source:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete source",
        variant: "destructive"
      });
    } finally {
      setDeletingSource(null);
    }
  };

  const filteredSources = sources.filter(source => {
    if (filterSourceType !== 'all' && source.source_type !== filterSourceType) return false;
    if (filterCategory !== 'all' && source.category !== filterCategory) return false;
    return true;
  });

  const uniqueCategories = [...new Set(sources.map(s => s.category))];
  const uniqueSourceTypes = [...new Set(sources.map(s => s.source_type))];

  if (loading) {
    return <div>Loading content pipeline...</div>;
  }

  return (
    <div className="space-y-6">
      <SupabaseHealthMonitor onConnectionIssue={handleConnectionIssue} />
      
      {connectionIssue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-800">
            <strong>Connection Issue Detected:</strong> There may be a problem with the Supabase connection. Retrying automatically...
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Content Pipeline</h2>
        <div className="flex gap-2">
          <ContentSourceManager onSourceAdded={fetchSources} />
          <Button 
            onClick={fetchPipelineData} 
            variant="outline"
            disabled={harvesting || settingUp || connectionIssue}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(harvesting || settingUp) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={runContentHarvester}
            disabled={harvesting || settingUp || connectionIssue}
            className="bg-thriphti-green hover:bg-thriphti-green/90"
          >
            <Play className="h-4 w-4 mr-2" />
            {harvesting ? 'Harvesting...' : 'Run AI Harvester'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pipeline">Pipeline Items</TabsTrigger>
          <TabsTrigger value="sources">Content Sources</TabsTrigger>
          <TabsTrigger value="rss">RSS Management</TabsTrigger>
          <TabsTrigger value="health">Source Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
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
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pipelineItems.filter(item => item.status === 'approved').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pipelineItems.filter(item => item.status === 'published').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Pipeline Items Table */}
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
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          {/* Enhanced Content Sources Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Content Sources
                <div className="flex gap-2">
                  <Select value={filterSourceType} onValueChange={setFilterSourceType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Source Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueSourceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No content sources found. Click "Setup Test Sources" to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Neighborhoods</TableHead>
                      <TableHead>Last Scraped</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {getSourceTypeIcon(source.source_type)}
                              {source.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {source.url}
                            </div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {source.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSourceTypeColor(source.source_type)}>
                            {source.source_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(source.priority)}>
                            {source.priority}/10
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                {Math.round((source.success_rate || 0) * 100)}%
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${source.success_rate > 0.8 ? 'bg-green-500' : source.success_rate > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${(source.success_rate || 0) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {source.successful_attempts || 0}/{source.total_attempts || 0} attempts
                            </div>
                            {source.consecutive_failures > 0 && (
                              <div className="text-xs text-red-600">
                                {source.consecutive_failures} consecutive failures
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {source.neighborhoods && source.neighborhoods.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {source.neighborhoods.slice(0, 2).map((neighborhood, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {neighborhood}
                                </Badge>
                              ))}
                              {source.neighborhoods.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{source.neighborhoods.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">All areas</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {source.last_scraped ? 
                            new Date(source.last_scraped).toLocaleDateString() : 
                            'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={source.active}
                            onCheckedChange={(checked) => toggleSourceActive(source.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedSource(source)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Content Source</DialogTitle>
                                </DialogHeader>
                                {selectedSource && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Name</Label>
                                        <Input value={selectedSource.name} readOnly />
                                      </div>
                                      <div>
                                        <Label>Source Type</Label>
                                        <Input value={selectedSource.source_type} readOnly />
                                      </div>
                                    </div>
                                    <div>
                                      <Label>URL</Label>
                                      <Input value={selectedSource.url} readOnly />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Priority (1-10)</Label>
                                        <Input type="number" value={selectedSource.priority} readOnly />
                                      </div>
                                      <div>
                                        <Label>Schedule (Cron)</Label>
                                        <Input value={selectedSource.schedule} readOnly />
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Neighborhoods</Label>
                                      <Input 
                                        value={selectedSource.neighborhoods?.join(', ') || ''} 
                                        readOnly 
                                        placeholder="No specific neighborhoods"
                                      />
                                    </div>
                                    <div>
                                      <Label>Keywords</Label>
                                      <Input 
                                        value={selectedSource.keywords?.join(', ') || ''} 
                                        readOnly 
                                        placeholder="No specific keywords"
                                      />
                                    </div>
                                    <div>
                                      <Label>Scrape Configuration</Label>
                                      <Textarea 
                                        value={JSON.stringify(selectedSource.scrape_config, null, 2)} 
                                        readOnly 
                                        rows={8}
                                        className="font-mono text-sm"
                                      />
                                    </div>
                                    {selectedSource.last_error_message && (
                                      <div>
                                        <Label>Last Error</Label>
                                        <Textarea 
                                          value={selectedSource.last_error_message} 
                                          readOnly 
                                          rows={3}
                                          className="text-red-600"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={deletingSource === source.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Content Source</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <p>Are you sure you want to permanently delete this content source?</p>
                                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <p><strong>Name:</strong> {source.name}</p>
                                    <p><strong>URL:</strong> {source.url}</p>
                                    <p><strong>Type:</strong> {source.source_type}</p>
                                    <p><strong>Status:</strong> {source.active ? 'Active' : 'Inactive'}</p>
                                  </div>
                                  <p className="text-red-600 font-medium">This action cannot be undone.</p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteSource(source.id, source.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingSource === source.id}
                                >
                                  {deletingSource === source.id ? 'Deleting...' : 'Delete Source'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rss" className="space-y-6">
          <RssSetupWizard 
            onComplete={fetchSources}
            onCancel={() => {}}
          />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <SourceHealthMonitor />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sources.length}</div>
                <p className="text-sm text-gray-500">
                  {sources.filter(s => s.active).length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sources.length > 0 ? Math.round((sources.reduce((acc, s) => acc + (s.success_rate || 0), 0) / sources.length) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Priority Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sources.filter(s => s.priority >= 8).length}
                </div>
                <p className="text-sm text-gray-500">
                  Priority 8-10
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Source Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uniqueSourceTypes.map(type => {
                  const count = sources.filter(s => s.source_type === type).length;
                  const percentage = sources.length > 0 ? (count / sources.length) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSourceTypeIcon(type)}
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-thriphti-green h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
