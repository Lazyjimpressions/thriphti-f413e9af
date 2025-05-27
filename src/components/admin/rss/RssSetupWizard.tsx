
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import RssDiscoveryPanel from "./RssDiscoveryPanel";
import RssFeedTester from "./RssFeedTester";
import RssConfigurationPanel from "./RssConfigurationPanel";

interface RssSetupWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
}

export default function RssSetupWizard({ onComplete, onCancel }: RssSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeed, setSelectedFeed] = useState<{ url: string; name: string } | null>(null);
  const [feedValid, setFeedValid] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const steps = [
    { number: 1, title: "Choose RSS Feed", description: "Select or add an RSS feed source" },
    { number: 2, title: "Test Feed", description: "Validate and preview feed content" },
    { number: 3, title: "Configure", description: "Set up filtering and processing rules" },
    { number: 4, title: "Review & Save", description: "Review settings and save the source" }
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleFeedSelect = (url: string, name: string) => {
    setSelectedFeed({ url, name });
    setCurrentStep(2);
  };

  const handleFeedValidation = (isValid: boolean, items?: FeedItem[]) => {
    setFeedValid(isValid);
    if (items) {
      setFeedItems(items);
    }
  };

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
  };

  const handleSave = async () => {
    if (!selectedFeed || !config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('content_sources')
        .insert({
          url: selectedFeed.url,
          name: config.name,
          category: config.category,
          source_type: 'rss',
          active: config.active,
          priority: config.priority,
          schedule: config.schedule,
          keywords: config.keywords.length > 0 ? config.keywords : null,
          neighborhoods: config.neighborhoods.length > 0 ? config.neighborhoods : null,
          max_retries: 3,
          scrape_config: {
            type: 'rss',
            link_filters: config.linkFilters,
            content_filters: config.contentFilters
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "RSS feed source has been added successfully!"
      });

      onComplete();

    } catch (error: any) {
      console.error('Error saving RSS source:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save RSS source",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedFeed !== null;
      case 2: return feedValid;
      case 3: return config !== null;
      case 4: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Add RSS Feed Source</h2>
        <p className="text-gray-600">
          Follow these steps to set up a new RSS feed for thrifting content
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            <div className="grid grid-cols-4 gap-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`text-center p-3 rounded-lg border ${
                    step.number === currentStep
                      ? 'border-blue-200 bg-blue-50'
                      : step.number < currentStep
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {step.number < currentStep ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.number === currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.number}
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <RssDiscoveryPanel onFeedSelect={handleFeedSelect} />
        )}

        {currentStep === 2 && selectedFeed && (
          <RssFeedTester
            feedUrl={selectedFeed.url}
            feedName={selectedFeed.name}
            onValidationComplete={handleFeedValidation}
          />
        )}

        {currentStep === 3 && selectedFeed && (
          <RssConfigurationPanel
            initialConfig={{
              name: selectedFeed.name,
              url: selectedFeed.url
            }}
            onConfigChange={handleConfigChange}
          />
        )}

        {currentStep === 4 && selectedFeed && config && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Save</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">RSS Feed Setup Complete!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Your RSS feed is configured and ready to start collecting thrifting content.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Feed Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {config.name}</div>
                      <div><span className="font-medium">URL:</span> {selectedFeed.url}</div>
                      <div><span className="font-medium">Category:</span> {config.category.replace('_', ' ')}</div>
                      <div><span className="font-medium">Priority:</span> {config.priority}/10</div>
                      <div><span className="font-medium">Status:</span> {config.active ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Keywords:</span> {config.keywords.length} configured</div>
                      <div><span className="font-medium">Neighborhoods:</span> {config.neighborhoods.length || 'All areas'}</div>
                      <div><span className="font-medium">Schedule:</span> Every 4 hours</div>
                      <div><span className="font-medium">Filters:</span> Content & link processing enabled</div>
                    </div>
                  </div>
                </div>

                {feedItems.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Sample Content ({feedItems.length} items)</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {feedItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-gray-600 text-xs">{item.description?.substring(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : prevStep}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          onClick={currentStep === steps.length ? handleSave : nextStep}
          disabled={!canProceed() || saving}
        >
          {currentStep === steps.length ? (
            saving ? 'Saving...' : 'Save RSS Source'
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
