
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Rss, Plus, ExternalLink, AlertCircle, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface SuggestedFeed {
  name: string;
  url: string;
  description: string;
  category: string;
  popularity: number;
  status: 'active' | 'inactive' | 'unknown' | 'problematic';
  issues?: string[];
}

interface ValidationResult {
  isValid: boolean;
  title?: string;
  description?: string;
  items?: any[];
  error?: string;
  itemCount?: number;
}

interface AddNewFeedPanelProps {
  onFeedAdded: () => void;
  onCancel: () => void;
}

const suggestedFeeds: SuggestedFeed[] = [
  {
    name: "Craigslist - Garage Sales Dallas",
    url: "https://dallas.craigslist.org/search/gms?format=rss",
    description: "Craigslist garage sale listings for Dallas area",
    category: "Garage Sales", 
    popularity: 9,
    status: 'unknown'
  },
  {
    name: "Estate Sale Network",
    url: "https://www.estatesales.org/RSS",
    description: "Estate sale listings and updates nationwide",
    category: "Estate Sales",
    popularity: 7,
    status: 'unknown'
  },
  {
    name: "Garage Sale Tracker",
    url: "https://gsalr.com/rss",
    description: "Community-driven garage sale listings and announcements",
    category: "Garage Sales",
    popularity: 6,
    status: 'problematic',
    issues: ["Feed URL may not exist", "Check site for actual RSS feeds"]
  },
  {
    name: "Yard Sale Search",
    url: "https://yardsalesearch.com/rss",
    description: "Yard sale and garage sale finder",
    category: "Garage Sales",
    popularity: 6,
    status: 'unknown'
  }
];

export default function AddNewFeedPanel({ onFeedAdded, onCancel }: AddNewFeedPanelProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Garage Sales");
  const [customPriority, setCustomPriority] = useState("7");
  const [urlError, setUrlError] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ValidationResult | null>(null);
  const [saving, setSaving] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const validateCustomUrl = (url: string) => {
    if (!url.trim()) {
      setUrlError("");
      return true;
    }
    
    if (!isValidUrl(url)) {
      setUrlError("Please enter a valid HTTP or HTTPS URL");
      return false;
    }
    
    setUrlError("");
    return true;
  };

  const handleCustomUrlChange = (value: string) => {
    setCustomUrl(value);
    validateCustomUrl(value);
    setTestResult(null);
  };

  const testFeed = async (url: string, name?: string) => {
    setTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-rss-feed', {
        body: { url }
      });

      if (error) throw error;

      setTestResult(data);
      
      if (data.isValid) {
        toast({
          title: "Feed Valid!",
          description: `Found ${data.itemCount || 0} items in "${data.title || name || 'the feed'}"`,
        });
      } else {
        toast({
          title: "Feed Invalid",
          description: data.error || "The RSS feed could not be validated",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error testing RSS feed:', error);
      const errorResult = {
        isValid: false,
        error: error.message || "Failed to test RSS feed"
      };
      setTestResult(errorResult);
      
      toast({
        title: "Test Failed",
        description: errorResult.error,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const saveFeed = async (url: string, name: string, category: string, priority: number, isValid: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('content_sources')
        .insert({
          name,
          url,
          category,
          priority,
          source_type: 'rss',
          active: isValid,
          configuration: {
            auto_categorize: true,
            extract_images: true,
            min_confidence: 0.7
          }
        });

      if (error) throw error;

      toast({
        title: "RSS Feed Added",
        description: `"${name}" has been added successfully`,
      });

      onFeedAdded();
    } catch (error: any) {
      console.error('Error saving RSS feed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save RSS feed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestedFeed = async (feed: SuggestedFeed) => {
    await testFeed(feed.url, feed.name);
  };

  const handleTestAndAdd = async () => {
    if (!customUrl || !customName) return;
    await testFeed(customUrl, customName);
  };

  const handleSaveFeed = () => {
    if (!testResult || !customUrl || !customName) return;
    
    const priority = parseInt(customPriority) || 7;
    saveFeed(customUrl, customName, customCategory, priority, testResult.isValid);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'problematic':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'problematic') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Add New RSS Feed</h3>
        <p className="text-gray-600 mb-6">
          Choose a suggested feed or add your own custom RSS feed URL. We'll test it before adding to ensure it works properly.
        </p>
      </div>

      {/* Custom Feed Input */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom RSS Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="feedName">Feed Name</Label>
              <Input
                id="feedName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="My Custom Thrift Feed"
              />
            </div>
            <div>
              <Label htmlFor="feedCategory">Category</Label>
              <Input
                id="feedCategory"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Garage Sales"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Label htmlFor="feedUrl">RSS Feed URL</Label>
              <Input
                id="feedUrl"
                value={customUrl}
                onChange={(e) => handleCustomUrlChange(e.target.value)}
                placeholder="https://example.com/feed.rss"
                type="url"
                className={urlError ? "border-red-300" : ""}
              />
              {urlError && (
                <div className="flex items-center gap-2 mt-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{urlError}</span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="feedPriority">Priority (1-10)</Label>
              <Input
                id="feedPriority"
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value)}
                placeholder="7"
                type="number"
                min="1"
                max="10"
              />
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${testResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${testResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.isValid ? 'Feed Valid!' : 'Feed Invalid'}
                </span>
              </div>
              {testResult.isValid ? (
                <div className="text-sm text-green-700">
                  <p><strong>Title:</strong> {testResult.title}</p>
                  <p><strong>Items Found:</strong> {testResult.itemCount || 0}</p>
                  {testResult.description && <p><strong>Description:</strong> {testResult.description}</p>}
                </div>
              ) : (
                <p className="text-sm text-red-700">{testResult.error}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleTestAndAdd}
              disabled={!customUrl || !customName || !!urlError || testing}
              variant="outline"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Feed'
              )}
            </Button>
            
            {testResult && (
              <Button
                onClick={handleSaveFeed}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${testResult.isValid ? 'Active' : 'Inactive'} Feed`
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Feeds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Suggested Feeds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {suggestedFeeds.map((feed, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{feed.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {feed.category}
                    </Badge>
                    <Badge className={`text-xs flex items-center gap-1 ${getStatusColor(feed.status)}`}>
                      {getStatusIcon(feed.status)}
                      {feed.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feed.description}</p>
                  
                  {feed.issues && feed.issues.length > 0 && (
                    <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                      <div className="flex items-center gap-1 text-orange-700 font-medium mb-1">
                        <AlertCircle className="h-3 w-3" />
                        Known Issues:
                      </div>
                      <ul className="list-disc list-inside text-orange-600">
                        {feed.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs break-all">
                      {feed.url}
                    </span>
                    <button
                      onClick={() => window.open(feed.url, '_blank')}
                      className="text-gray-400 hover:text-gray-600"
                      title="Open in browser"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm font-medium">{feed.popularity}/10</div>
                    <div className="text-xs text-gray-500">popularity</div>
                  </div>
                  <Button
                    onClick={() => handleSuggestedFeed(feed)}
                    size="sm"
                    variant={feed.status === 'problematic' ? 'outline' : 'default'}
                    disabled={testing}
                  >
                    {testing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      feed.status === 'problematic' ? 'Try Anyway' : 'Test & Add'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
