
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Eye, Calendar, MapPin, Star, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import EventCard from "@/components/EventCard";

interface ContentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPublish: (id: string) => void;
  isLoading: boolean;
}

// Helper function to extract image from various data sources
function extractImageUrl(processedData: any, rawData: any): string | null {
  // Check multiple possible image field names
  const imageFields = ['image_url', 'image', 'imageUrl', 'img', 'picture', 'photo'];
  
  // First check processed data
  for (const field of imageFields) {
    if (processedData?.[field]) {
      return processedData[field];
    }
  }
  
  // Then check raw data
  for (const field of imageFields) {
    if (rawData?.[field]) {
      return rawData[field];
    }
  }
  
  return null;
}

// Custom EventCard wrapper that disables navigation in preview mode
function PreviewEventCard({ event }: { event: any }) {
  return (
    <div className="relative">
      <EventCard event={event} onSelect={() => {}} />
      <div className="absolute inset-0 bg-transparent cursor-default" />
      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
        Preview Mode
      </div>
    </div>
  );
}

export function ContentPreviewModal({ 
  open, 
  onOpenChange, 
  item, 
  onApprove, 
  onReject, 
  onPublish,
  isLoading 
}: ContentPreviewModalProps) {
  if (!item) return null;

  const processedData = item.processed_data || {};
  const rawData = item.raw_data || {};
  
  // Extract image with better fallback logic
  const imageUrl = extractImageUrl(processedData, rawData);
  
  // Create a mock event/article object for preview
  const previewContent = {
    id: item.id,
    title: processedData.title || rawData.title || 'No Title',
    description: processedData.description || rawData.description || '',
    location: processedData.location || rawData.location || 'Dallas, TX',
    venue: processedData.location || rawData.location || 'Dallas, TX',
    event_date: processedData.date || new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    category: processedData.category || item.content_type || 'unknown',
    neighborhood: 'Dallas',
    price_range: 'varies',
    featured: false,
    organizer: 'Community Event',
    image_url: imageUrl || '/placeholder.svg'
  };

  const isEvent = ['garage_sale', 'estate_sale', 'flea_market'].includes(previewContent.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Preview
            <Badge variant="secondary" className="ml-2">
              {item.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Actions */}
          <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
            {item.status === 'pending' && (
              <>
                <Button
                  onClick={() => onApprove(item.id)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onReject(item.id)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            {item.status === 'processed' && (
              <Button
                onClick={() => onPublish(item.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Publish to Site
              </Button>
            )}
          </div>

          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
              <TabsTrigger value="processed">Processed Data</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="bg-white p-6 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">How this will appear on the site:</h3>
                <div className="max-w-sm">
                  {isEvent ? (
                    <PreviewEventCard event={previewContent} />
                  ) : (
                    <div className="relative">
                      <Card className="overflow-hidden">
                        <div className="relative w-full h-48 bg-gray-200">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={previewContent.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">No image available</span>
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary">
                              {previewContent.category}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <h3 className="font-serif text-xl text-gray-900 line-clamp-2">
                            {previewContent.title}
                          </h3>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {previewContent.description}
                          </p>
                        </CardContent>
                      </Card>
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Preview Mode
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>Note:</strong> This is a preview of unpublished content. The "View Details" button will work after publishing.
                </div>
              </div>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Content Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Relevance Score: {item.relevance_score || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Created: {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Source:</span>
                    <span>{item.content_sources?.name || 'Unknown'}</span>
                  </div>
                  {rawData.url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <a 
                        href={rawData.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Original Source
                      </a>
                    </div>
                  )}
                  {imageUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Image URL:</span>
                      <span className="text-xs text-gray-500 break-all">{imageUrl}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="processed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Processed Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(processedData).length === 0 ? (
                    <div className="text-gray-500 text-sm">No processed data available</div>
                  ) : (
                    Object.entries(processedData).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <div className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm mt-1">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Original Raw Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(rawData).length === 0 ? (
                    <div className="text-gray-500 text-sm">No raw data available</div>
                  ) : (
                    Object.entries(rawData).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <div className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm mt-1 break-all">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
