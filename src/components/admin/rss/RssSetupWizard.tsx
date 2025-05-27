
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Rss, Plus, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import AddNewFeedPanel from "./AddNewFeedPanel";

interface RssSource {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  last_scraped: string;
  success_rate: number;
  total_attempts: number;
  successful_attempts: number;
  consecutive_failures: number;
  last_error_message: string;
  neighborhoods: string[];
  keywords: string[];
  priority: number;
}

interface RssSetupWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function RssSetupWizard({ onComplete, onCancel }: RssSetupWizardProps) {
  const [activeTab, setActiveTab] = useState("existing");
  const [rssSources, setRssSources] = useState<RssSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSource, setDeletingSource] = useState<string | null>(null);

  useEffect(() => {
    fetchRssSources();
  }, []);

  const fetchRssSources = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sources')
        .select('*')
        .eq('source_type', 'rss')
        .order('priority', { ascending: false });

      if (error) throw error;

      setRssSources((data as unknown as RssSource[]) || []);
    } catch (error) {
      console.error('Error fetching RSS sources:', error);
      toast({
        title: "Error",
        description: "Failed to fetch RSS sources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRssSource = async (sourceId: string, sourceName: string) => {
    setDeletingSource(sourceId);
    try {
      const { error } = await supabase
        .from('content_sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;

      setRssSources(prev => prev.filter(source => source.id !== sourceId));

      toast({
        title: "RSS Feed Deleted",
        description: `"${sourceName}" has been permanently deleted`
      });

      onComplete(); // Refresh parent component

    } catch (error: any) {
      console.error('Error deleting RSS source:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete RSS feed",
        variant: "destructive"
      });
    } finally {
      setDeletingSource(null);
    }
  };

  const getHealthBadge = (source: RssSource) => {
    if (source.consecutive_failures > 3) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
    }
    if (source.success_rate > 0.8) {
      return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Healthy</Badge>;
    }
    if (source.success_rate > 0.5) {
      return <Badge variant="secondary" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Warning</Badge>;
    }
    return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Poor</Badge>;
  };

  if (loading) {
    return <div>Loading RSS feeds...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rss className="h-6 w-6 text-orange-600" />
          <h3 className="text-xl font-semibold">RSS Feed Management</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Close
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Feeds ({rssSources.length})</TabsTrigger>
          <TabsTrigger value="add-new">Add New Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current RSS Feeds
                <Button 
                  onClick={() => setActiveTab("add-new")}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add RSS Feed
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rssSources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Rss className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No RSS feeds configured</p>
                  <p className="mb-4">Get started by adding RSS feeds for local content</p>
                  <Button 
                    onClick={() => setActiveTab("add-new")}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add RSS Feed
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feed</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Last Scraped</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rssSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Rss className="h-4 w-4 text-orange-600" />
                              {source.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {source.url}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{source.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getHealthBadge(source)}
                            <div className="text-xs text-gray-500">
                              {Math.round((source.success_rate || 0) * 100)}% success
                            </div>
                            {source.consecutive_failures > 0 && (
                              <div className="text-xs text-red-600">
                                {source.consecutive_failures} failures
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={source.priority >= 8 ? "default" : source.priority >= 6 ? "secondary" : "outline"}>
                            {source.priority}/10
                          </Badge>
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
                        <TableCell>
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
                                <AlertDialogTitle>Delete RSS Feed</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <p>Are you sure you want to permanently delete this RSS feed?</p>
                                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <p><strong>Name:</strong> {source.name}</p>
                                    <p><strong>URL:</strong> {source.url}</p>
                                    <p><strong>Category:</strong> {source.category}</p>
                                    <p><strong>Success Rate:</strong> {Math.round((source.success_rate || 0) * 100)}%</p>
                                    <p><strong>Status:</strong> {source.active ? 'Active' : 'Inactive'}</p>
                                  </div>
                                  <p className="text-red-600 font-medium">This action cannot be undone. All content scraped from this feed will remain, but no new content will be fetched.</p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteRssSource(source.id, source.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingSource === source.id}
                                >
                                  {deletingSource === source.id ? 'Deleting...' : 'Delete RSS Feed'}
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

        <TabsContent value="add-new" className="space-y-4">
          <AddNewFeedPanel 
            onFeedAdded={() => {
              fetchRssSources();
              setActiveTab("existing");
            }}
            onCancel={() => setActiveTab("existing")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
