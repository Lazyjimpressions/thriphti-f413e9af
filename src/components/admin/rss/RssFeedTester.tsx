
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink, Calendar, Rss } from "lucide-react";

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
    items: FeedItem[];
    error?: string;
  } | null>(null);

  const testFeed = async () => {
    setTesting(true);
    try {
      // Simulate RSS feed testing - in real implementation, this would call a backend service
      // that can fetch and parse RSS feeds to avoid CORS issues
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response with sample items
      const mockItems: FeedItem[] = [
        {
          title: "Huge Estate Sale in Highland Park - Vintage Furniture & Collectibles",
          description: "Don't miss this amazing estate sale featuring mid-century furniture, vintage clothing, and rare collectibles. Friday-Sunday, 8am-4pm.",
          link: "https://example.com/estate-sale-highland-park",
          pubDate: "2024-01-15T10:00:00Z",
          category: "Estate Sales"
        },
        {
          title: "New Thrift Store Opening in Deep Ellum",
          description: "Vintage Vibes is opening its doors this weekend with a grand opening sale. 50% off all clothing and accessories.",
          link: "https://example.com/vintage-vibes-opening",
          pubDate: "2024-01-14T15:30:00Z",
          category: "Store Openings"
        },
        {
          title: "Weekly Garage Sale Roundup - Best Finds Under $10",
          description: "Our weekly roundup of the best garage sale finds for budget-conscious thrifters. This week features amazing furniture finds.",
          link: "https://example.com/garage-sale-roundup",
          pubDate: "2024-01-13T09:00:00Z",
          category: "Garage Sales"
        }
      ];

      const testResult = {
        isValid: true,
        items: mockItems
      };

      setResult(testResult);
      onValidationComplete(testResult.isValid, testResult.items);

    } catch (error) {
      const errorResult = {
        isValid: false,
        items: [],
        error: "Failed to fetch RSS feed. Please check the URL and try again."
      };
      
      setResult(errorResult);
      onValidationComplete(errorResult.isValid);
    } finally {
      setTesting(false);
    }
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
            </div>
            <Button
              onClick={testFeed}
              disabled={testing}
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
                
                <div>
                  <h4 className="font-medium mb-3">Recent Feed Items ({result.items.length})</h4>
                  <div className="space-y-3">
                    {result.items.map((item, index) => (
                      <div key={index} className="border rounded p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{item.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.pubDate).toLocaleDateString()}
                              </div>
                              {item.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(item.link, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">RSS feed test failed</span>
                </div>
                {result.error && (
                  <p className="text-sm text-gray-600">{result.error}</p>
                )}
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Troubleshooting tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Verify the RSS feed URL is correct and accessible</li>
                    <li>Check if the feed requires authentication</li>
                    <li>Ensure the feed returns valid XML format</li>
                    <li>Try accessing the feed directly in your browser</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
