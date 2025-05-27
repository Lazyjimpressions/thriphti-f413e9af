
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";

interface RssSource {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  priority: number;
}

interface RssFeedInlineEditorProps {
  source: RssSource;
  onSave: () => void;
  onCancel: () => void;
}

export default function RssFeedInlineEditor({ source, onSave, onCancel }: RssFeedInlineEditorProps) {
  const [name, setName] = useState(source.name);
  const [url, setUrl] = useState(source.url);
  const [category, setCategory] = useState(source.category);
  const [priority, setPriority] = useState(source.priority);
  const [active, setActive] = useState(source.active);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('content_sources')
        .update({
          name,
          url,
          category,
          priority: Number(priority),
          active
        })
        .eq('id', source.id);

      if (error) throw error;

      toast({
        title: "RSS Feed Updated",
        description: "Feed settings have been saved successfully"
      });

      onSave();
    } catch (error: any) {
      console.error('Error updating RSS source:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update RSS feed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 border-l-4 border-orange-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Feed Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Feed name"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="news, events, business"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="url">RSS Feed URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed.rss"
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority (1-10)</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="10"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="active">Status</Label>
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded"
            />
            <Badge variant={active ? "default" : "secondary"}>
              {active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              Save Changes
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
