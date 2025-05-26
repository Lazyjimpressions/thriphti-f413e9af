import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, TestTube } from "lucide-react";

interface ContentSource {
  id?: string;
  url: string;
  name: string;
  category: string;
  source_type: string;
  active: boolean;
  scrape_config: any;
  schedule: string;
  priority: number;
  neighborhoods: string[];
  keywords: string[];
  max_retries: number;
}

interface ContentSourceManagerProps {
  onSourceAdded?: () => void;
}

const defaultSource: ContentSource = {
  url: '',
  name: '',
  category: 'thrift_stores',
  source_type: 'web_scrape',
  active: true,
  scrape_config: {},
  schedule: '0 */4 * * *',
  priority: 5,
  neighborhoods: [],
  keywords: [],
  max_retries: 3
};

const sourceTypes = [
  { value: 'rss', label: 'RSS Feed' },
  { value: 'web_scrape', label: 'Web Scraping' },
  { value: 'email', label: 'Email Newsletter' },
  { value: 'api', label: 'API Integration' },
  { value: 'calendar', label: 'Calendar Feed' }
];

const categories = [
  { value: 'thrift_stores', label: 'Thrift Stores' },
  { value: 'garage_sales', label: 'Garage Sales' },
  { value: 'estate_sales', label: 'Estate Sales' },
  { value: 'events', label: 'Events' },
  { value: 'new_stores', label: 'New Store Openings' },
  { value: 'neighborhood', label: 'Neighborhood News' },
  { value: 'blogs_tips', label: 'Blogs & Tips' },
  { value: 'community', label: 'Community Posts' },
  { value: 'news', label: 'News' },
  { value: 'aggregated', label: 'Aggregated Content' }
];

export default function ContentSourceManager({ onSourceAdded }: ContentSourceManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<ContentSource>(defaultSource);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Parse neighborhoods and keywords from comma-separated strings
      const neighborhoods = source.neighborhoods.length > 0 ? source.neighborhoods : null;
      const keywords = source.keywords.length > 0 ? source.keywords : null;

      const { error } = await supabase
        .from('content_sources')
        .insert({
          ...source,
          neighborhoods,
          keywords,
          scrape_config: typeof source.scrape_config === 'string' 
            ? JSON.parse(source.scrape_config) 
            : source.scrape_config
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content source added successfully"
      });

      setSource(defaultSource);
      setIsOpen(false);
      onSourceAdded?.();

    } catch (error: any) {
      console.error('Error saving source:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save content source",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // This would test the source configuration
      // For now, we'll just validate the basic setup
      if (!source.url || !source.name) {
        throw new Error('URL and name are required');
      }

      if (source.source_type === 'web_scrape' && (!source.scrape_config || Object.keys(source.scrape_config).length === 0)) {
        throw new Error('Web scraping sources require scrape configuration');
      }

      toast({
        title: "Test Successful",
        description: "Source configuration appears valid"
      });

    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const updateNeighborhoods = (value: string) => {
    const neighborhoods = value.split(',').map(n => n.trim()).filter(n => n.length > 0);
    setSource(prev => ({ ...prev, neighborhoods }));
  };

  const updateKeywords = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setSource(prev => ({ ...prev, keywords }));
  };

  const getExampleConfig = (sourceType: string) => {
    const examples = {
      rss: { parser: 'standard', limit: 50 },
      web_scrape: {
        selectors: {
          listing: '.item',
          title: '.title',
          url: 'a',
          description: '.description'
        },
        pagination: true
      },
      email: {
        parser: 'newsletter',
        keywords: ['sale', 'discount', 'special']
      },
      api: {
        auth: 'api_key',
        endpoints: ['/events', '/sales']
      },
      calendar: {
        format: 'ical',
        filter_keywords: ['flea market', 'garage sale']
      }
    };
    return examples[sourceType as keyof typeof examples] || {};
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Content Source</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  value={source.name}
                  onChange={(e) => setSource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Dallas Thrift Store News"
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={source.url}
                  onChange={(e) => setSource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/feed.rss"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source_type">Source Type</Label>
                <Select 
                  value={source.source_type} 
                  onValueChange={(value) => {
                    setSource(prev => ({ 
                      ...prev, 
                      source_type: value,
                      scrape_config: getExampleConfig(value)
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={source.category} 
                  onValueChange={(value) => setSource(prev => ({ ...prev, category: value }))}
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
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={source.priority}
                  onChange={(e) => setSource(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="schedule">Schedule (Cron)</Label>
                <Input
                  id="schedule"
                  value={source.schedule}
                  onChange={(e) => setSource(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="0 */4 * * *"
                />
              </div>
              <div>
                <Label htmlFor="max_retries">Max Retries</Label>
                <Input
                  id="max_retries"
                  type="number"
                  min="1"
                  max="10"
                  value={source.max_retries}
                  onChange={(e) => setSource(prev => ({ ...prev, max_retries: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="neighborhoods">Target Neighborhoods (comma-separated)</Label>
                <Input
                  id="neighborhoods"
                  value={source.neighborhoods.join(', ')}
                  onChange={(e) => updateNeighborhoods(e.target.value)}
                  placeholder="deep ellum, oak cliff, bishop arts"
                />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={source.keywords.join(', ')}
                  onChange={(e) => updateKeywords(e.target.value)}
                  placeholder="thrift, vintage, garage sale"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={source.active}
                onCheckedChange={(checked) => setSource(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          {/* Scrape Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scrape Configuration</h3>
              <Badge variant="outline">{source.source_type}</Badge>
            </div>
            <div>
              <Label htmlFor="scrape_config">Configuration JSON</Label>
              <Textarea
                id="scrape_config"
                value={JSON.stringify(source.scrape_config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    setSource(prev => ({ ...prev, scrape_config: config }));
                  } catch {
                    // Invalid JSON, keep the string for now
                    setSource(prev => ({ ...prev, scrape_config: e.target.value }));
                  }
                }}
                rows={10}
                className="font-mono text-sm"
                placeholder="Enter JSON configuration..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Configuration varies by source type. See documentation for examples.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || saving}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {testing ? 'Testing...' : 'Test Configuration'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || testing}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Source'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
