
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ApiStatus {
  configured: boolean;
  tested: boolean;
  lastTested?: string;
  error?: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [openaiKey, setOpenaiKey] = useState("");
  const [firecrawlKey, setFirecrawlKey] = useState("");
  const [openaiStatus, setOpenaiStatus] = useState<ApiStatus>({ configured: false, tested: false });
  const [firecrawlStatus, setFirecrawlStatus] = useState<ApiStatus>({ configured: false, tested: false });
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-api-status');
      if (error) throw error;
      
      if (data.openai) {
        setOpenaiStatus({
          configured: data.openai.configured,
          tested: data.openai.tested,
          lastTested: data.openai.lastTested
        });
      }
      
      if (data.firecrawl) {
        setFirecrawlStatus({
          configured: data.firecrawl.configured,
          tested: data.firecrawl.tested,
          lastTested: data.firecrawl.lastTested
        });
      }
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  };

  const testApiConnection = async (apiType: 'openai' | 'firecrawl') => {
    setTesting(apiType);
    try {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { apiType }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: `${apiType.toUpperCase()} API connection successful`,
        });
        
        if (apiType === 'openai') {
          setOpenaiStatus(prev => ({ ...prev, tested: true, lastTested: new Date().toISOString(), error: undefined }));
        } else {
          setFirecrawlStatus(prev => ({ ...prev, tested: true, lastTested: new Date().toISOString(), error: undefined }));
        }
      } else {
        throw new Error(data.error || 'Connection test failed');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `${apiType.toUpperCase()} connection failed: ${error.message}`,
        variant: "destructive",
      });
      
      if (apiType === 'openai') {
        setOpenaiStatus(prev => ({ ...prev, tested: false, error: error.message }));
      } else {
        setFirecrawlStatus(prev => ({ ...prev, tested: false, error: error.message }));
      }
    } finally {
      setTesting(null);
    }
  };

  const saveApiKey = async (apiType: 'openai' | 'firecrawl', key: string) => {
    if (!key.trim()) {
      toast({
        title: "Error",
        description: "API key cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSaving(apiType);
    try {
      const { data, error } = await supabase.functions.invoke('update-api-key', {
        body: { apiType, apiKey: key }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${apiType.toUpperCase()} API key updated successfully`,
      });

      if (apiType === 'openai') {
        setOpenaiStatus(prev => ({ ...prev, configured: true }));
        setOpenaiKey("");
      } else {
        setFirecrawlStatus(prev => ({ ...prev, configured: true }));
        setFirecrawlKey("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update ${apiType.toUpperCase()} API key: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const getStatusBadge = (status: ApiStatus) => {
    if (!status.configured) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
    if (status.tested) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
    }
    if (status.error) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Not Tested</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Settings</h3>
        <p className="text-sm text-gray-600">Manage API keys and test connections</p>
      </div>

      {/* OpenAI Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">OpenAI API</CardTitle>
              <CardDescription>Used for website analysis and content generation</CardDescription>
            </div>
            {getStatusBadge(openaiStatus)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="openai-key">API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <Button 
                onClick={() => saveApiKey('openai', openaiKey)}
                disabled={!openaiKey.trim() || saving === 'openai'}
                size="sm"
              >
                {saving === 'openai' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
          
          {openaiStatus.configured && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-gray-600">
                {openaiStatus.lastTested && (
                  <span>Last tested: {new Date(openaiStatus.lastTested).toLocaleString()}</span>
                )}
                {openaiStatus.error && (
                  <span className="text-red-600">Error: {openaiStatus.error}</span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testApiConnection('openai')}
                disabled={testing === 'openai'}
              >
                {testing === 'openai' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Connection'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Firecrawl Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Firecrawl API</CardTitle>
              <CardDescription>Used for website scraping and content extraction</CardDescription>
            </div>
            {getStatusBadge(firecrawlStatus)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="firecrawl-key">API Key</Label>
              <Input
                id="firecrawl-key"
                type="password"
                placeholder="fc-..."
                value={firecrawlKey}
                onChange={(e) => setFirecrawlKey(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <Button 
                onClick={() => saveApiKey('firecrawl', firecrawlKey)}
                disabled={!firecrawlKey.trim() || saving === 'firecrawl'}
                size="sm"
              >
                {saving === 'firecrawl' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
          
          {firecrawlStatus.configured && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-gray-600">
                {firecrawlStatus.lastTested && (
                  <span>Last tested: {new Date(firecrawlStatus.lastTested).toLocaleString()}</span>
                )}
                {firecrawlStatus.error && (
                  <span className="text-red-600">Error: {firecrawlStatus.error}</span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testApiConnection('firecrawl')}
                disabled={testing === 'firecrawl'}
              >
                {testing === 'firecrawl' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Connection'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
