
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Upload,
  Loader2,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedItems: any[];
  onBulkApprove: () => Promise<void>;
  onBulkReject: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkPublish: () => Promise<void>;
  onClearSelection: () => void;
  currentTab: string;
}

export function BulkActionsBar({
  selectedCount,
  selectedItems,
  onBulkApprove,
  onBulkReject,
  onBulkDelete,
  onBulkPublish,
  onClearSelection,
  currentTab
}: BulkActionsBarProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (selectedCount === 0) return null;

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
      onClearSelection();
    } finally {
      setIsLoading(false);
    }
  };

  const canApprove = currentTab === 'pending';
  const canReject = currentTab === 'pending';
  const canPublish = currentTab === 'processed';

  // Check how many items can actually be published (valid ones)
  const publishableCount = selectedItems.filter(item => {
    const processedData = item.processed_data || {};
    return processedData.title && (processedData.description || processedData.actionable_details);
  }).length;

  return (
    <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-lg border-2">
      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {canApprove && (
            <Button
              size="sm"
              onClick={() => handleAction(onBulkApprove)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve
            </Button>
          )}

          {canReject && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Rejection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject {selectedCount} items? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction(onBulkReject)}>
                    Reject {selectedCount} Items
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canPublish && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={isLoading || publishableCount === 0}
                  className="flex items-center gap-2"
                  title={publishableCount === 0 ? "No valid items to publish" : `Publish ${publishableCount} valid items`}
                >
                  <Upload className="h-4 w-4" />
                  Publish {publishableCount > 0 ? `(${publishableCount})` : ''}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Publishing</AlertDialogTitle>
                  <AlertDialogDescription>
                    {publishableCount === selectedCount ? (
                      `Are you sure you want to publish ${selectedCount} items?`
                    ) : (
                      `${publishableCount} out of ${selectedCount} selected items are valid for publishing. Invalid items will be skipped.`
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction(onBulkPublish)}>
                    Publish {publishableCount} Items
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete {selectedCount} items? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleAction(onBulkDelete)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete {selectedCount} Items
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
