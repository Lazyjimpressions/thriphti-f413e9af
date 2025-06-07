
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { analyzeStoreWebsite } from '@/integrations/supabase/storeQueries';
import { Loader2, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisResult {
  success: boolean;
  storeId?: string;
  error?: string;
}

export default function WebsiteAnalyzer() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive"
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const analysisResult = await analyzeStoreWebsite(url);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(analysisResult);

      if (analysisResult.success) {
        toast({
          title: "Success!",
          description: "Store website analyzed and added for review",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: analysisResult.error || "Failed to analyze website",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      setResult({
        success: false,
        error: error.message || 'Unexpected error occurred'
      });
      toast({
        title: "Error",
        description: "Failed to analyze website",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setResult(null);
    setProgress(0);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-thriphti-green" />
          <CardTitle>AI Store Website Analyzer</CardTitle>
        </div>
        <CardDescription>
          Enter a store website URL to automatically extract store information and create a profile for review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="website-url" className="text-sm font-medium">
            Store Website URL
          </label>
          <div className="flex gap-2">
            <Input
              id="website-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://primethrift.com"
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !url.trim()}
              className="bg-thriphti-green hover:bg-thriphti-green/90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Analyze Website'
              )}
            </Button>
          </div>
        </div>

        {isAnalyzing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">
              {progress < 30 && "Scraping website content..."}
              {progress >= 30 && progress < 70 && "Analyzing store information..."}
              {progress >= 70 && progress < 100 && "Validating and processing..."}
              {progress === 100 && "Finalizing results..."}
            </p>
          </div>
        )}

        {result && (
          <div className="mt-4">
            {result.success ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Analysis Successful!</p>
                  <p className="text-sm text-green-600">
                    Store profile created and added to the review queue. Store ID: {result.storeId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Analysis Failed</p>
                  <p className="text-sm text-red-600">{result.error}</p>
                </div>
              </div>
            )}
            <Button 
              onClick={handleReset}
              variant="outline" 
              className="mt-3 w-full"
            >
              Analyze Another Website
            </Button>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">How it works:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>AI scrapes the website content cleanly and safely</li>
            <li>Extracts store details like hours, location, specialties</li>
            <li>Validates the store is in the Dallas-Fort Worth area</li>
            <li>Generates compelling descriptions and categorization</li>
            <li>Creates store profile in the admin review queue</li>
          </ol>
          <div className="mt-3">
            <Badge variant="outline" className="text-xs">
              Powered by Firecrawl + OpenAI
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
