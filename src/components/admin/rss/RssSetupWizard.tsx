import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Rss, Plus, Trash2, AlertTriangle, CheckCircle, XCircle, Edit, TestTube, Filter } from "lucide-react";
import AddNewFeedPanel from "./AddNewFeedPanel";
import RssFeedInlineEditor from "./RssFeedInlineEditor";
import RssFeedTesterInline from "./RssFeedTesterInline";
import RssContentPreview from "./RssContentPreview";

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
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [testingSource, setTestingSource] = useState<string | null>(null);
  const [previewingSource, setPreviewingSource] = useState<string | null>(null);

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

      onComplete();

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
    if (!source.active) {
      return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Inactive</Badge>;
    }
    
    // If no attempts yet, show as pending
    if (source.total_attempts === 0) {
      return <Badge variant="outline" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Pending</Badge>;
    }
    
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

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'lifestyle_articles': 'Lifestyle Articles',
      'local_news': 'Local News', 
      'events_calendars': 'Events Calendars',
      'real_estate': 'Real Estate',
      'community_boards': 'Community Boards',
      'retail_blogs': 'Retail Blogs',
      'business_news': 'Business News',
      'classified_ads': 'Classified Ads',
      // Legacy categories
      'thrift_stores': 'Thrift Stores (Legacy)',
      'garage_sales': 'Garage Sales (Legacy)', 
      'estate_sales': 'Estate Sales (Legacy)',
      'events': 'Events (Legacy)',
      'new_stores': 'New Stores (Legacy)',
      'neighborhood': 'Neighborhood (Legacy)'
    };
    return categoryMap[category] || category;
  };

  const handleEditSave = () => {
    setEditingSource(null);
    fetchRssSources();
    onComplete();
  };

  if (loading) {
    return <div>Loading RSS feeds...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rss className="h-6 w-6 text-orange-600" />
          <div>
            <h3 className="text-xl font-semibold">RSS Content Sources</h3>
            <p className="text-sm text-gray-600">General feeds filtered for thrift-related content</p>
          </div>
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
          <TabsTrigger value="existing">Content Sources ({rssSources.length})</TabsTrigger>
          <TabsTrigger value="add-new">Add New Source</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                RSS Content Sources
                <Button 
                  onClick={() => setActiveTab("add-new")}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rssSources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Rss className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No content sources configured</p>
                  <p className="mb-4">Add RSS feeds from general publications to filter for thrift content</p>
                  <Button 
                    onClick={() => setActiveTab("add-new")}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add RSS Source
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Priority</TableHead>
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
                              {source.keywords && source.keywords.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Keywords: {source.keywords.slice(0, 3).join(', ')}{source.keywords.length > 3 ? '...' : ''}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(source.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getHealthBadge(source)}
                              <div className="text-xs text-gray-500">
                                {source.total_attempts === 0 ? 'Not processed yet' : 
                                  `${Math.round((source.success_rate || 0) * 100)}% success (${source.successful_attempts}/${source.total_attempts})`
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={source.priority >= 8 ? "default" : source.priority >= 6 ? "secondary" : "outline"}>
                              {source.priority}/10
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={source.active ? "default" : "secondary"}>
                              {source.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSource(source.id)}
                                disabled={editingSource === source.id}
                                title="Edit source"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTestingSource(source.id)}
                                disabled={testingSource === source.id}
                                title="Test feed validation"
                              >
                                <TestTube className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewingSource(source.id)}
                                disabled={previewingSource === source.id}
                                title="Preview content filtering"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Filter className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={deletingSource === source.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete source"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete RSS Source</AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-2">
                                      <p>Are you sure you want to permanently delete this RSS source?</p>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        <p><strong>Name:</strong> {source.name}</p>
                                        <p><strong>URL:</strong> {source.url}</p>
                                      </div>
                                      <p className="text-red-600 font-medium">This action cannot be undone.</p>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRssSource(source.id, source.name)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={deletingSource === source.id}
                                    >
                                      {deletingSource === source.id ? 'Deleting...' : 'Delete Source'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Inline Editor */}
                  {editingSource && (
                    <div className="mt-4">
                      {rssSources
                        .filter(source => source.id === editingSource)
                        .map(source => (
                          <RssFeedInlineEditor
                            key={source.id}
                            source={source}
                            onSave={handleEditSave}
                            onCancel={() => setEditingSource(null)}
                          />
                        ))}
                    </div>
                  )}

                  {/* Inline Tester */}
                  {testingSource && (
                    <div className="mt-4">
                      {rssSources
                        .filter(source => source.id === testingSource)
                        .map(source => (
                          <RssFeedTesterInline
                            key={source.id}
                            feedUrl={source.url}
                            feedName={source.name}
                            onClose={() => setTestingSource(null)}
                          />
                        ))}
                    </div>
                  )}

                  {/* Content Preview */}
                  {previewingSource && (
                    <div className="mt-4">
                      {rssSources
                        .filter(source => source.id === previewingSource)
                        .map(source => (
                          <RssContentPreview
                            key={source.id}
                            feedUrl={source.url}
                            feedName={source.name}
                            keywords={source.keywords || []}
                            neighborhoods={source.neighborhoods || []}
                            onClose={() => setPreviewingSource(null)}
                          />
                        ))}
                    </div>
                  )}
                </div>
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
