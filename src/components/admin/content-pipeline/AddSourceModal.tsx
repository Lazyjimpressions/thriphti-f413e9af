
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceCreated: (source: {
    name: string;
    source_type: string;
    url: string;
    category: string;
    geographic_focus?: string;
    keywords?: string[];
  }) => void;
}

export function AddSourceModal({ open, onOpenChange, onSourceCreated }: AddSourceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    source_type: "",
    url: "",
    category: "",
    geographic_focus: "",
    keywords: [] as string[],
    keywordInput: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSourceCreated({
      name: formData.name,
      source_type: formData.source_type,
      url: formData.url,
      category: formData.category,
      geographic_focus: formData.geographic_focus || undefined,
      keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
    });

    // Reset form
    setFormData({
      name: "",
      source_type: "",
      url: "",
      category: "",
      geographic_focus: "",
      keywords: [],
      keywordInput: ""
    });
  };

  const addKeyword = () => {
    if (formData.keywordInput.trim() && !formData.keywords.includes(formData.keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, prev.keywordInput.trim()],
        keywordInput: ""
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Content Source</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. D Magazine Events"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source_type">Source Type</Label>
              <Select value={formData.source_type} onValueChange={(value) => setFormData(prev => ({ ...prev, source_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss_feed">RSS Feed</SelectItem>
                  <SelectItem value="web_scrape">Web Scrape</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="email_alert">Email Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/feed.xml"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="stores">Stores</SelectItem>
                  <SelectItem value="articles">Articles</SelectItem>
                  <SelectItem value="mixed">Mixed Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="geographic_focus">Geographic Focus</Label>
              <Input
                id="geographic_focus"
                value={formData.geographic_focus}
                onChange={(e) => setFormData(prev => ({ ...prev, geographic_focus: e.target.value }))}
                placeholder="e.g. Dallas, Deep Ellum"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                value={formData.keywordInput}
                onChange={(e) => setFormData(prev => ({ ...prev, keywordInput: e.target.value }))}
                onKeyPress={handleKeywordInputKeyPress}
                placeholder="Add keyword and press Enter"
              />
              <Button type="button" onClick={addKeyword} variant="outline">
                Add
              </Button>
            </div>
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.source_type || !formData.url || !formData.category}>
              Add Source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
