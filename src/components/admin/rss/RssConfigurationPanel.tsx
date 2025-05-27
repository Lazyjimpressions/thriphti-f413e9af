
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Filter, Link, Calendar, MapPin } from "lucide-react";

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
  { value: 'thrift_stores', label: 'Thrift Stores' },
  { value: 'garage_sales', label: 'Garage Sales' },
  { value: 'estate_sales', label: 'Estate Sales' },
  { value: 'events', label: 'Events' },
  { value: 'new_stores', label: 'New Store Openings' },
  { value: 'neighborhood', label: 'Neighborhood News' }
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
    category: initialConfig.category || 'thrift_stores',
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
      minWordCount: 20,
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
        <h3 className="text-lg font-semibold mb-2">Configure RSS Feed</h3>
        <p className="text-gray-600">
          Set up how this RSS feed should be processed and filtered for thrifting content
        </p>
      </div>

      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="Dallas Thrift Store News"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={config.priority}
                onChange={(e) => updateConfig({ priority: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="schedule">Update Schedule</Label>
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

      {/* Content Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Content Filtering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="keywords">Include Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={config.keywords.join(', ')}
              onChange={(e) => updateKeywords(e.target.value)}
              placeholder="thrift, vintage, garage sale, estate sale"
            />
            <p className="text-xs text-gray-500 mt-1">
              Content must contain at least one of these keywords to be included
            </p>
          </div>

          <div>
            <Label htmlFor="requireKeywords">Required Keywords (comma-separated)</Label>
            <Input
              id="requireKeywords"
              value={config.contentFilters.requireKeywords.join(', ')}
              onChange={(e) => updateRequireKeywords(e.target.value)}
              placeholder="sale, discount, Dallas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Content must contain ALL of these keywords
            </p>
          </div>

          <div>
            <Label htmlFor="excludeKeywords">Exclude Keywords (comma-separated)</Label>
            <Input
              id="excludeKeywords"
              value={config.contentFilters.excludeKeywords.join(', ')}
              onChange={(e) => updateExcludeKeywords(e.target.value)}
              placeholder="spam, advertisement, promotion"
            />
            <p className="text-xs text-gray-500 mt-1">
              Content containing these keywords will be filtered out
            </p>
          </div>

          <div>
            <Label htmlFor="minWords">Minimum Word Count</Label>
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
              Content must have at least this many words
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Targeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Targeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="neighborhoods">Target Neighborhoods (comma-separated)</Label>
            <Input
              id="neighborhoods"
              value={config.neighborhoods.join(', ')}
              onChange={(e) => updateNeighborhoods(e.target.value)}
              placeholder="deep ellum, oak cliff, bishop arts, uptown"
            />
            <p className="text-xs text-gray-500 mt-1">
              Focus on content from these specific Dallas neighborhoods (leave empty for all areas)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Link Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="removeParams"
              checked={config.linkFilters.removeParams}
              onCheckedChange={(checked) => updateConfig({
                linkFilters: { ...config.linkFilters, removeParams: checked }
              })}
            />
            <Label htmlFor="removeParams">Remove tracking parameters from URLs</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="replaceShortUrls"
              checked={config.linkFilters.replaceShortUrls}
              onCheckedChange={(checked) => updateConfig({
                linkFilters: { ...config.linkFilters, replaceShortUrls: checked }
              })}
            />
            <Label htmlFor="replaceShortUrls">Expand shortened URLs (bit.ly, tinyurl, etc.)</Label>
          </div>

          <div>
            <Label htmlFor="customRules">Custom URL Processing Rules</Label>
            <Textarea
              id="customRules"
              value={config.linkFilters.customRules}
              onChange={(e) => updateConfig({
                linkFilters: { ...config.linkFilters, customRules: e.target.value }
              })}
              placeholder="Enter custom regex rules for URL processing (one per line)"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Advanced: Use regex patterns to modify URLs before processing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={config.active ? "default" : "secondary"}>
                {config.active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">Priority {config.priority}</Badge>
              <Badge variant="outline">{config.category.replace('_', ' ')}</Badge>
            </div>
            
            {config.keywords.length > 0 && (
              <div>
                <span className="text-sm font-medium">Keywords: </span>
                <span className="text-sm text-gray-600">{config.keywords.join(', ')}</span>
              </div>
            )}
            
            {config.neighborhoods.length > 0 && (
              <div>
                <span className="text-sm font-medium">Neighborhoods: </span>
                <span className="text-sm text-gray-600">{config.neighborhoods.join(', ')}</span>
              </div>
            )}

            <div>
              <span className="text-sm font-medium">Schedule: </span>
              <span className="text-sm text-gray-600">
                {scheduleOptions.find(opt => opt.value === config.schedule)?.label || config.schedule}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
