
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSourceModal({ open, onOpenChange }: AddSourceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    url: "",
    geographic_focus: "",
    keywords: ""
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testDetails, setTestDetails] = useState<any>(null);

  const handleTestFeed = async () => {
    if (!formData.url) {
      toast.error("Please enter a URL to test");
      return;
    }

    setTesting(true);
    setTestResult(null);
    
    try {
      // Simulate testing for now - this would call an actual validation function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful test result
      setTestResult('success');
      setTestDetails({
        title: "D Magazine - Best of Dallas",
        description: "Local Dallas news and events",
        itemCount: 25,
        lastUpdated: new Date().toLocaleDateString()
      });
      
      toast.success("Feed test successful!");
    } catch (error) {
      setTestResult('error');
      setTestDetails({ error: "Could not connect to feed" });
      toast.error("Feed test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.url) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Here we would save to the database
    console.log("Creating source:", formData);
    toast.success("Content source created successfully!");
    
    // Reset form and close modal
    setFormData({ name: "", type: "", url: "", geographic_focus: "", keywords: "" });
    setTestResult(null);
    setTestDetails(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({ name: "", type: "", url: "", geographic_focus: "", keywords: "" });
    setTestResult(null);
    setTestDetails(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Content Source</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name *</Label>
              <Input
                id="name"
                placeholder="e.g., D Magazine Events Feed"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Source Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss_feed">RSS Feed</SelectItem>
                  <SelectItem value="email_alert">Email Alert</SelectItem>
                  <SelectItem value="api">API Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Source URL *</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://example.com/rss"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestFeed}
                disabled={testing || !formData.url}
                className="flex items-center gap-2"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Test"
                )}
              </Button>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${testResult === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${testResult === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                  {testResult === 'success' ? 'Test Successful' : 'Test Failed'}
                </span>
              </div>
              
              {testResult === 'success' && testDetails && (
                <div className="text-sm space-y-1">
                  <p><strong>Title:</strong> {testDetails.title}</p>
                  <p><strong>Description:</strong> {testDetails.description}</p>
                  <p><strong>Recent Items:</strong> {testDetails.itemCount}</p>
                  <p><strong>Last Updated:</strong> {testDetails.lastUpdated}</p>
                </div>
              )}
              
              {testResult === 'error' && testDetails && (
                <p className="text-sm text-red-700">{testDetails.error}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="geographic_focus">Geographic Focus</Label>
            <Input
              id="geographic_focus"
              placeholder="e.g., Dallas, Plano, Deep Ellum"
              value={formData.geographic_focus}
              onChange={(e) => setFormData({ ...formData, geographic_focus: e.target.value })}
            />
            <p className="text-xs text-gray-500">Dallas neighborhoods or areas to prioritize</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords & Topics</Label>
            <Textarea
              id="keywords"
              placeholder="thrift, vintage, secondhand, estate sale, garage sale, flea market"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-gray-500">Keywords to help AI identify relevant content</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Source
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
