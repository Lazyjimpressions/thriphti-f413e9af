
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, ExternalLink, Calendar, X } from "lucide-react";

interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
}

interface RssFeedTesterInlineProps {
  feedUrl: string;
  feedName: string;
  onClose: () => void;
}

export default function RssFeedTesterInline({ feedUrl, feedName, onClose }: RssFeedTesterInlineProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    title?: string;
    description?: string;
    items: FeedItem[];
    error?: string;
    itemCount?: number;
  } | null>(null);

  const testFeed = async () => {
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

      const testResult = {
        isValid: data.isValid,
        title: data.title,
        description: data.description,
        items: data.items || [],
        itemCount: data.itemCount || 0,
        error: data.error
      };

      setResult(testResult);

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

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-blue-50 p-4 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Testing: {feedName}</h4>
        <Button onClick={onClose} variant="outline" size="sm">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={testFeed} disabled={testing} size="sm">
          {testing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Feed"
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {result.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${result.isValid ? 'text-green-700' : 'text-red-700'}`}>
              {result.isValid ? 'Feed is valid!' : 'Feed validation failed'}
            </span>
          </div>

          {result.error && (
            <div className="bg-red-100 border border-red-200 rounded p-2">
              <p className="text-xs text-red-700">{result.error}</p>
            </div>
          )}

          {result.isValid && result.items.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">
                Recent Items ({result.itemCount})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-white border rounded p-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-gray-600 mt-1">
                            {truncateText(item.description)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.pubDate)}</span>
                          {item.category && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
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
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
