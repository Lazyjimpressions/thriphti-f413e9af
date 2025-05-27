
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Rss, Plus, ExternalLink, AlertCircle } from "lucide-react";

interface SuggestedFeed {
  name: string;
  url: string;
  description: string;
  category: string;
  popularity: number;
  status: 'active' | 'inactive' | 'unknown';
}

interface RssDiscoveryPanelProps {
  onFeedSelect: (url: string, name: string) => void;
}

const suggestedFeeds: SuggestedFeed[] = [
  {
    name: "Garage Sale Tracker",
    url: "https://gsalr.com/rss",
    description: "Community-driven garage sale listings and announcements",
    category: "Garage Sales",
    popularity: 8,
    status: 'unknown'
  },
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
    name: "Yard Sale Search",
    url: "https://yardsalesearch.com/rss",
    description: "Yard sale and garage sale finder",
    category: "Garage Sales",
    popularity: 6,
    status: 'unknown'
  }
];

export default function RssDiscoveryPanel({ onFeedSelect }: RssDiscoveryPanelProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [urlError, setUrlError] = useState("");

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
  };

  const handleCustomFeed = () => {
    if (customUrl && customName && isValidUrl(customUrl)) {
      onFeedSelect(customUrl, customName);
      setCustomUrl("");
      setCustomName("");
      setUrlError("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose an RSS Feed Source</h3>
        <p className="text-gray-600 mb-6">
          Select a suggested RSS feed or add your own custom feed URL. We'll validate the feed before adding it to your sources.
        </p>
      </div>

      {/* Popular Feeds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Suggested Thrifting RSS Feeds
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
                    <Badge className={`text-xs ${getStatusColor(feed.status)}`}>
                      {feed.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feed.description}</p>
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
                    onClick={() => onFeedSelect(feed.url, feed.name)}
                    size="sm"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> These are suggested feeds that may work for thrifting content. 
              We'll validate each feed when you select it to ensure it's accessible and contains valid RSS data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Feed Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Custom RSS Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Feed Name</label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="My Custom Thrift Feed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">RSS Feed URL</label>
              <Input
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
              <p className="text-xs text-gray-500 mt-1">
                Common RSS feed URLs end with: /rss, /feed, /feed.xml, or /rss.xml
              </p>
            </div>
            <Button
              onClick={handleCustomFeed}
              disabled={!customUrl || !customName || !!urlError}
              className="w-full"
            >
              Add Custom Feed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
