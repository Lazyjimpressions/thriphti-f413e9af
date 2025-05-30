
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Filter, Link, Calendar, MapPin, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RssConfig {
  name: string;
  url: string;
  category: string;
  priority: number;
  schedule: string;
  keywords: string[];
  neighborhoods: string[];
  linkFilters: {
    removeParams: boolean;
    replaceShortUrls: boolean;
    customRules: string;
  };
  contentFilters: {
    minWordCount: number;
    excludeKeywords: string[];
    requireKeywords: string[];
  };
  active: boolean;
}

interface RssConfigurationPanelProps {
  initialConfig: Partial<RssConfig>;
  onConfigChange: (config: RssConfig) => void;
}

const categories = [
  { value: 'lifestyle_articles', label: 'Lifestyle Articles (General magazines, lifestyle blogs)' },
  { value: 'local_news', label: 'Local News (City papers, neighborhood news)' },
  { value: 'events_calendars', label: 'Events Calendars (General event listings)' },
  { value: 'real_estate', label: 'Real Estate (Property listings, home sales)' },
  { value: 'community_boards', label: 'Community Boards (Nextdoor, community forums)' },
  { value: 'retail_blogs', label: 'Retail Blogs (Shopping, retail industry news)' },
  { value: 'business_news', label: 'Business News (New business openings, closures)' },
  { value: 'classified_ads', label: 'Classified Ads (Craigslist, marketplace feeds)' }
];

const scheduleOptions = [
  { value: '0 */1 * * *', label: 'Every hour' },
  { value: '0 */2 * * *', label: 'Every 2 hours' },
  { value: '0 */4 * * *', label: 'Every 4 hours' },
  { value: '0 */6 * * *', label: 'Every 6 hours' },
  { value: '0 */12 * * *', label: 'Every 12 hours' },
  { value: '0 0 * * *', label: 'Daily' }
];

export default function RssConfigurationPanel({ initialConfig, onConfigChange }: RssConfigurationPanelProps) {
  const [config, setConfig] = useState<RssConfig>({
    name: initialConfig.name || '',
    url: initialConfig.url || '',
    category: initialConfig.category || 'lifestyle_articles',
    priority: initialConfig.priority || 5,
    schedule: initialConfig.schedule || '0 */4 * * *',
    keywords: initialConfig.keywords || [],
    neighborhoods: initialConfig.neighborhoods || [],
    linkFilters: {
      removeParams: true,
      replaceShortUrls: true,
      customRules: ''
    },
    contentFilters: {
      minWordCount: 50,
      excludeKeywords: [],
      requireKeywords: []
    },
    active: initialConfig.active !== false
  });

  const updateConfig = (updates: Partial<RssConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const updateKeywords = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    updateConfig({ keywords });
  };

  const updateNeighborhoods = (value: string) => {
    const neighborhoods = value.split(',').map(n => n.trim()).filter(n => n.length > 0);
    updateConfig({ neighborhoods });
  };

  const updateRequireKeywords = (value: string) => {
    const requireKeywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    updateConfig({ 
      contentFilters: { 
        ...config.contentFilters, 
        requireKeywords 
      }
    });
  };

  const updateExcludeKeywords = (value: string) => {
    const excludeKeywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    updateConfig({ 
      contentFilters: { 
        ...config.contentFilters, 
        excludeKeywords 
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure RSS Feed for Thrift Content Filtering</h3>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This system takes general RSS feeds (like D Magazine) and filters them using AI to find thrift-related content. 
            The feed doesn't need to be thrift-specific - we'll extract relevant articles automatically.
          </AlertDescription>
        </Alert>
      </div>

      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Source Feed Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Feed Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="D Magazine RSS Feed"
              />
            </div>
            <div>
              <Label htmlFor="category">Source Type</Label>
              <Select 
                value={config.category} 
                onValueChange={(value) => updateConfig({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="url">RSS Feed URL</Label>
            <Input
              id="url"
              value={config.url}
              onChange={(e) => updateConfig({ url: e.target.value })}
              placeholder="https://www.dmagazine.com/feed/"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Processing Priority (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={config.priority}
                onChange={(e) => updateConfig({ priority: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher priority feeds are processed first
              </p>
            </div>
            <div>
              <Label htmlFor="schedule">Check for Updates</Label>
              <Select 
                value={config.schedule} 
                onValueChange={(value) => updateConfig({ schedule: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scheduleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={config.active}
              onCheckedChange={(checked) => updateConfig({ active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Thrift Content Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Thrift Content Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="keywords">Thrift-Related Keywords (comma-separated)</Label>
            <Textarea
              id="keywords"
              value={config.keywords.join(', ')}
              onChange={(e) => updateKeywords(e.target.value)}
              placeholder="thrift store, vintage, garage sale, estate sale, consignment, secondhand, antique, flea market, yard sale, resale"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              AI will look for articles containing these keywords to identify thrift-related content
            </p>
          </div>

          <div>
            <Label htmlFor="requireKeywords">Must-Have Keywords (comma-separated)</Label>
            <Input
              id="requireKeywords"
              value={config.contentFilters.requireKeywords.join(', ')}
              onChange={(e) => updateRequireKeywords(e.target.value)}
              placeholder="Dallas, Texas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Articles must contain ALL of these keywords (useful for location filtering)
            </p>
          </div>

          <div>
            <Label htmlFor="excludeKeywords">Exclude Keywords (comma-separated)</Label>
            <Input
              id="excludeKeywords"
              value={config.contentFilters.excludeKeywords.join(', ')}
              onChange={(e) => updateExcludeKeywords(e.target.value)}
              placeholder="advertisement, sponsored, promotion, job posting"
            />
            <p className="text-xs text-gray-500 mt-1">
              Articles containing these keywords will be ignored
            </p>
          </div>

          <div>
            <Label htmlFor="minWords">Minimum Article Length</Label>
            <Input
              id="minWords"
              type="number"
              min="1"
              value={config.contentFilters.minWordCount}
              onChange={(e) => updateConfig({
                contentFilters: {
                  ...config.contentFilters,
                  minWordCount: parseInt(e.target.value)
                }
              })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Skip very short articles (avoids processing snippets and ads)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Targeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Local Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="neighborhoods">Target Dallas Neighborhoods (comma-separated)</Label>
            <Textarea
              id="neighborhoods"
              value={config.neighborhoods.join(', ')}
              onChange={(e) => updateNeighborhoods(e.target.value)}
              placeholder="Deep Ellum, Oak Cliff, Bishop Arts District, Uptown, Downtown, Highland Park, University Park"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Prioritize content mentioning these specific Dallas areas (leave empty to include all areas)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={config.active ? "default" : "secondary"}>
                {config.active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">Priority {config.priority}</Badge>
              <Badge variant="outline">
                {categories.find(c => c.value === config.category)?.label.split('(')[0].trim() || config.category}
              </Badge>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
              <p><strong>Process:</strong> Fetch articles from {config.name} → Filter for thrift keywords → Generate editorial content</p>
              
              {config.keywords.length > 0 && (
                <p><strong>Looking for:</strong> {config.keywords.slice(0, 5).join(', ')}{config.keywords.length > 5 ? '...' : ''}</p>
              )}
              
              {config.neighborhoods.length > 0 && (
                <p><strong>Focus areas:</strong> {config.neighborhoods.slice(0, 3).join(', ')}{config.neighborhoods.length > 3 ? '...' : ''}</p>
              )}

              <p><strong>Check frequency:</strong> {scheduleOptions.find(opt => opt.value === config.schedule)?.label || config.schedule}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
