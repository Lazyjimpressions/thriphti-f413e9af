
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Edit3, Eye, Calendar, MapPin, Star, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getContentPipelineItems, 
  updatePipelineItemStatus, 
  publishPipelineItem,
  bulkUpdatePipelineItemStatus,
  bulkDeletePipelineItems,
  bulkPublishPipelineItems
} from "@/integrations/supabase/contentQueries";
import { format } from "date-fns";
import { ContentPreviewModal } from "./ContentPreviewModal";
import { BulkActionsBar } from "./BulkActionsBar";
import { useBulkSelection } from "@/hooks/useBulkSelection";

interface ContentReviewInterfaceProps {
  onItemsUpdated?: () => void;
}

// Type helper for processed data
interface ProcessedData {
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  date?: string;
  actionable_details?: string;
}

// Type helper for raw data
interface RawData {
  title?: string;
  description?: string;
  location?: string;
  url?: string;
}

export function ContentReviewInterface({ onItemsUpdated }: ContentReviewInterfaceProps) {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pipeline items
  const { data: pipelineItems = [], isLoading, refetch } = useQuery({
    queryKey: ['content-pipeline-items'],
    queryFn: getContentPipelineItems,
  });

  // Filter items by status
  const pendingItems = pipelineItems.filter(item => item.status === 'pending');
  const processedItems = pipelineItems.filter(item => item.status === 'processed');
  const publishedItems = pipelineItems.filter(item => item.status === 'published');
  const rejectedItems = pipelineItems.filter(item => item.status === 'rejected');

  // Get current tab items
  const getCurrentTabItems = () => {
    switch (selectedTab) {
      case 'pending': return pendingItems;
      case 'processed': return processedItems;
      case 'published': return publishedItems;
      case 'rejected': return rejectedItems;
      default: return [];
    }
  };

  // Bulk selection hook
  const bulkSelection = useBulkSelection({
    items: getCurrentTabItems(),
    getItemId: (item) => item.id
  });

  // Reset selection when tab changes
  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
    bulkSelection.clearSelection();
  };

  // Mutations for status updates
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updatePipelineItemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-stats'] });
      onItemsUpdated?.();
      refetch();
      setShowPreviewModal(false);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishPipelineItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-stats'] });
      onItemsUpdated?.();
      refetch();
      setShowPreviewModal(false);
      toast({
        title: "Published Successfully",
        description: "Content has been published to the site.",
      });
    },
    onError: (error: any) => {
      console.error('Publishing error:', error);
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish content. Please check the console for details.",
        variant: "destructive",
      });
    },
  });

  // Bulk operations
  const bulkApproveMutation = useMutation({
    mutationFn: (ids: string[]) => bulkUpdatePipelineItemStatus(ids, 'processed'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-stats'] });
      onItemsUpdated?.();
      refetch();
      toast({
        title: "Bulk Approved",
        description: `${data.length} items have been approved.`,
      });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (ids: string[]) => bulkUpdatePipelineItemStatus(ids, 'rejected'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-stats'] });
      onItemsUpdated?.();
      refetch();
      toast({
        title: "Bulk Rejected",
        description: `${data.length} items have been rejected.`,
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeletePipelineItems(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-stats'] });
      onItemsUpdated?.();
      refetch();
      toast({
        title: "Bulk Deleted",
        description: "Selected items have been deleted.",
      });
    },
  });

  const bulkPublishMutation = useMutation({
    mutationFn: (ids: string[]) => bulkPublishPipelineItems(ids),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-pipeline-stats'] });
      onItemsUpdated?.();
      refetch();
      
      if (results.failed.length > 0) {
        toast({
          title: "Bulk Publishing Completed",
          description: `${results.success.length} items published successfully, ${results.failed.length} failed.`,
          variant: results.success.length > 0 ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Bulk Published",
          description: `${results.success.length} items have been published.`,
        });
      }
    },
  });

  // Event handlers
  const handlePreview = (item: any) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'processed' });
      toast({
        title: "Approved",
        description: "Content has been approved for review.",
      });
    } catch (error: any) {
      console.error('Approval error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve content",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'rejected' });
      toast({
        title: "Rejected",
        description: "Content has been rejected.",
      });
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject content",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (id: string) => {
    console.log('Publishing item:', id);
    try {
      await publishMutation.mutateAsync(id);
    } catch (error: any) {
      console.error('Publishing error in component:', error);
    }
  };

  // Bulk action handlers
  const handleBulkApprove = async () => {
    const selectedItems = bulkSelection.getSelectedItems();
    const ids = selectedItems.map(item => item.id);
    await bulkApproveMutation.mutateAsync(ids);
  };

  const handleBulkReject = async () => {
    const selectedItems = bulkSelection.getSelectedItems();
    const ids = selectedItems.map(item => item.id);
    await bulkRejectMutation.mutateAsync(ids);
  };

  const handleBulkDelete = async () => {
    const selectedItems = bulkSelection.getSelectedItems();
    const ids = selectedItems.map(item => item.id);
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleBulkPublish = async () => {
    const selectedItems = bulkSelection.getSelectedItems();
    // Only include valid items for publishing
    const validItems = selectedItems.filter(item => {
      const processedData = item.processed_data || {};
      return processedData.title && (processedData.description || processedData.actionable_details);
    });
    const ids = validItems.map(item => item.id);
    await bulkPublishMutation.mutateAsync(ids);
  };

  const validateItemForPublishing = (item: any): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    const processedData = item.processed_data as ProcessedData | null;
    
    if (!processedData?.title) {
      issues.push('Missing title');
    }
    
    if (!processedData?.description && !processedData?.actionable_details) {
      issues.push('Missing content/description');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const renderContentTable = (items: any[], showActions = true) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={bulkSelection.isAllSelected}
              onCheckedChange={bulkSelection.toggleAll}
              ref={(el: HTMLInputElement | null) => {
                if (el) {
                  el.indeterminate = bulkSelection.isIndeterminate;
                }
              }}
            />
          </TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Relevance</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Date</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showActions ? 8 : 7} className="text-center text-gray-500 py-8">
              No items in this category
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            const processedData = item.processed_data as ProcessedData | null;
            const sourceData = item.raw_data as RawData | null;
            const validation = validateItemForPublishing(item);
            
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={bulkSelection.isSelected(item.id)}
                    onCheckedChange={() => bulkSelection.toggleItem(item.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {processedData?.title || sourceData?.title || 'No Title'}
                      {!validation.isValid && (
                        <span title={`Issues: ${validation.issues.join(', ')}`}>
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      {processedData?.description || sourceData?.description || 'No description'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {processedData?.category || item.content_type || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {processedData?.location || sourceData?.location || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {item.relevance_score || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {item.content_sources?.name || 'Unknown Source'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {format(new Date(item.created_at), 'MMM d, HH:mm')}
                  </div>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(item)}
                        className="h-8 px-3 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            disabled={updateStatusMutation.isPending}
                            className="h-8 px-3 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(item.id)}
                            disabled={updateStatusMutation.isPending}
                            className="h-8 px-3 text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {item.status === 'processed' && (
                        <Button
                          size="sm"
                          onClick={() => handlePublish(item.id)}
                          disabled={publishMutation.isPending || !validation.isValid}
                          className="h-8 px-3 text-xs"
                          title={!validation.isValid ? `Cannot publish: ${validation.issues.join(', ')}` : 'Publish content'}
                        >
                          {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading content review queue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Ready to Publish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processedItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Ready to Publish ({processedItems.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedItems.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Pending Review</h3>
            <div className="text-sm text-gray-500">
              Review and approve/reject new content
            </div>
          </div>
          {renderContentTable(pendingItems)}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ready to Publish</h3>
            <div className="text-sm text-gray-500">
              Approved content ready for publication
            </div>
          </div>
          {renderContentTable(processedItems)}
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Published Content</h3>
            <div className="text-sm text-gray-500">
              Content that's live on the site
            </div>
          </div>
          {renderContentTable(publishedItems, false)}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Rejected Content</h3>
            <div className="text-sm text-gray-500">
              Content that was rejected during review
            </div>
          </div>
          {renderContentTable(rejectedItems, false)}
        </TabsContent>
      </Tabs>

      <BulkActionsBar
        selectedCount={bulkSelection.selectedCount}
        selectedItems={bulkSelection.getSelectedItems()}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        onClearSelection={bulkSelection.clearSelection}
        currentTab={selectedTab}
      />

      <ContentPreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        item={previewItem}
        onApprove={handleApprove}
        onReject={handleReject}
        onPublish={handlePublish}
        isLoading={updateStatusMutation.isPending || publishMutation.isPending}
      />
    </div>
  );
}
