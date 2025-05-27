
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink, Calendar, Rss, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
}

interface RssFeedTesterProps {
  feedUrl: string;
  feedName: string;
  onValidationComplete: (isValid: boolean, items?: FeedItem[]) => void;
}

export default function RssFeedTester({ feedUrl, feedName, onValidationComplete }: RssFeedTesterProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    title?: string;
    description?: string;
    items: FeedItem[];
    error?: string;
    itemCount?: number;
  } | null>(null);

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const testFeed = async () => {
    if (!feedUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid RSS feed URL",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(feedUrl)) {
      const errorResult = {
        isValid: false,
        items: [],
        error: "Invalid URL format. Please provide a valid HTTP or HTTPS URL."
      };
      setResult(errorResult);
      onValidationComplete(errorResult.isValid);
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      console.log('Testing RSS feed:', feedUrl);
      
      const { data, error } = await supabase.functions.invoke('validate-rss-feed', {
        body: { url: feedUrl }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to validate RSS feed');
      }

      console.log('RSS validation result:', data);

      const testResult = {
        isValid: data.isValid,
        title: data.title,
        description: data.description,
        items: data.items || [],
        itemCount: data.itemCount || 0,
        error: data.error
      };

      setResult(testResult);
      onValidationComplete(testResult.isValid, testResult.items);

      if (testResult.isValid) {
        toast({
          title: "RSS feed validated",
          description: `Successfully validated feed with ${testResult.itemCount} items`
        });
      } else {
        toast({
          title: "RSS feed validation failed",
          description: testResult.error || "The RSS feed could not be validated",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('RSS validation error:', error);
      const errorResult = {
        isValid: false,
        items: [],
        error: error.message || "Failed to validate RSS feed. Please check the URL and try again."
      };
      
      setResult(errorResult);
      onValidationComplete(errorResult.isValid);

      toast({
        title: "Validation Error",
        description: errorResult.error,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Test RSS Feed</h3>
        <p className="text-gray-600">
          Let's validate your RSS feed and preview the content it will provide
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Feed Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Feed Name</label>
              <p className="font-medium">{feedName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Feed URL</label>
              <p className="text-sm break-all">{feedUrl}</p>
              {feedUrl && !isValidUrl(feedUrl) && (
                <div className="flex items-center gap-2 mt-1 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Invalid URL format</span>
                </div>
              )}
            </div>
            <Button
              onClick={testFeed}
              disabled={testing || !feedUrl.trim()}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Feed...
                </>
              ) : (
                "Test RSS Feed"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.isValid ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">RSS feed is valid and accessible!</span>
                </div>

                {result.title && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Feed Title</h4>
                    <p className="font-medium">{result.title}</p>
                  </div>
                )}

                {result.description && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Feed Description</h4>
                    <p className="text-sm text-gray-700">{truncateText(result.description, 200)}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-3">Recent Feed Items ({result.items.length})</h4>
                  {result.items.length > 0 ? (
                    <div className="space-y-3">
                      {result.items.map((item, index) => (
                        <div key={index} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium mb-1 line-clamp-2">{item.title}</h5>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                  {truncateText(item.description)}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(item.pubDate)}
                                </div>
                                {item.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {item.link && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(item.link, '_blank')}
                                title="Open article"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No items found in this feed</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">RSS feed validation failed</span>
                </div>
                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-700 font-medium">Error Details:</p>
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Troubleshooting tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Verify the RSS feed URL is correct and accessible</li>
                    <li>Check if the feed requires authentication or special headers</li>
                    <li>Ensure the feed returns valid XML format (RSS or Atom)</li>
                    <li>Try accessing the feed directly in your browser</li>
                    <li>Some feeds may be temporarily unavailable - try again later</li>
                  </ul>
                </div>
                {feedUrl && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(feedUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open URL in browser
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
