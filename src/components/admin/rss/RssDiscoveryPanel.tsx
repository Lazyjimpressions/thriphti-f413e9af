
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Rss, Plus, ExternalLink } from "lucide-react";

interface SuggestedFeed {
  name: string;
  url: string;
  description: string;
  category: string;
  popularity: number;
}

interface RssDiscoveryPanelProps {
  onFeedSelect: (url: string, name: string) => void;
}

const suggestedFeeds: SuggestedFeed[] = [
  {
    name: "Estate Sales News",
    url: "https://www.estatesales.net/rss",
    description: "National estate sale listings and updates",
    category: "Estate Sales",
    popularity: 9
  },
  {
    name: "Garage Sale Blog",
    url: "https://garagesaleblog.com/feed/",
    description: "Tips, finds, and garage sale announcements",
    category: "Garage Sales", 
    popularity: 8
  },
  {
    name: "Thrift Store Finds",
    url: "https://thriftstorefinds.com/rss",
    description: "Community posts about great thrift discoveries",
    category: "Thrift Stores",
    popularity: 7
  },
  {
    name: "Vintage Market News",
    url: "https://vintagemarket.net/feed",
    description: "Vintage markets and flea market announcements",
    category: "Vintage Markets",
    popularity: 6
  }
];

export default function RssDiscoveryPanel({ onFeedSelect }: RssDiscoveryPanelProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [customName, setCustomName] = useState("");

  const handleCustomFeed = () => {
    if (customUrl && customName) {
      onFeedSelect(customUrl, customName);
      setCustomUrl("");
      setCustomName("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose an RSS Feed Source</h3>
        <p className="text-gray-600 mb-6">
          Select a popular thrifting RSS feed or add your own custom feed URL
        </p>
      </div>

      {/* Popular Feeds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Popular Thrifting RSS Feeds
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
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feed.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{feed.url}</span>
                    <ExternalLink className="h-3 w-3" />
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
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/feed.rss"
                type="url"
              />
            </div>
            <Button
              onClick={handleCustomFeed}
              disabled={!customUrl || !customName}
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
