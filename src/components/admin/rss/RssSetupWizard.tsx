import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
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
  const [userChoice, setUserChoice] = useState<'proceed' | 'skip' | 'inactive' | null>(null);

  const steps = [
    { number: 1, title: "Choose RSS Feed", description: "Select or add an RSS feed source" },
    { number: 2, title: "Test Feed", description: "Validate and preview feed content" },
    { number: 3, title: "Configure", description: "Set up filtering and processing rules" },
    { number: 4, title: "Review & Save", description: "Review settings and save the source" }
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleFeedSelect = (url: string, name: string) => {
    setSelectedFeed({ url, name });
    setFeedValid(false);
    setUserChoice(null);
    setCurrentStep(2);
  };

  const handleFeedValidation = (isValid: boolean, items?: FeedItem[], choice?: 'proceed' | 'skip' | 'inactive') => {
    setFeedValid(isValid);
    setUserChoice(choice || null);
    
    if (items) {
      setFeedItems(items);
    }

    // Handle skip choice immediately
    if (choice === 'skip') {
      setCurrentStep(1);
      setSelectedFeed(null);
      setFeedValid(false);
      setUserChoice(null);
      toast({
        title: "Feed skipped",
        description: "Please choose a different RSS feed"
      });
    }
  };

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
  };

  const handleSave = async () => {
    if (!selectedFeed || !config) return;

    setSaving(true);
    try {
      // Determine if feed should be active based on validation and user choice
      const shouldBeActive = feedValid || userChoice === 'proceed';
      const finalActive = userChoice === 'inactive' ? false : (config.active && shouldBeActive);

      const { error } = await supabase
        .from('content_sources')
        .insert({
          url: selectedFeed.url,
          name: config.name,
          category: config.category,
          source_type: 'rss',
          active: finalActive,
          priority: config.priority,
          schedule: config.schedule,
          keywords: config.keywords.length > 0 ? config.keywords : null,
          neighborhoods: config.neighborhoods.length > 0 ? config.neighborhoods : null,
          max_retries: 3,
          scrape_config: {
            type: 'rss',
            link_filters: config.linkFilters,
            content_filters: config.contentFilters,
            validation_failed: !feedValid,
            user_choice: userChoice
          }
        });

      if (error) throw error;

      const statusMessage = finalActive 
        ? "RSS feed source has been added and is active!"
        : "RSS feed source has been saved as inactive";

      toast({
        title: "Success",
        description: statusMessage
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
      case 2: return feedValid || userChoice === 'proceed' || userChoice === 'inactive';
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

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    if (status === 'completed') {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    
    if (status === 'current') {
      // Show warning if on step 2 and feed validation failed
      if (stepNumber === 2 && !feedValid && userChoice) {
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      }
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
          {stepNumber}
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">
        {stepNumber}
      </div>
    );
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
              {steps.map((step) => {
                const status = getStepStatus(step.number);
                return (
                  <div
                    key={step.number}
                    className={`text-center p-3 rounded-lg border ${
                      status === 'current'
                        ? 'border-blue-200 bg-blue-50'
                        : status === 'completed'
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {getStepIcon(step.number)}
                    </div>
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    {step.number === 2 && !feedValid && userChoice && (
                      <p className="text-xs text-amber-600 mt-1">
                        {userChoice === 'proceed' && "Proceeding with invalid feed"}
                        {userChoice === 'inactive' && "Will save as inactive"}
                      </p>
                    )}
                  </div>
                );
              })}
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
              url: selectedFeed.url,
              active: feedValid || userChoice === 'proceed' // Default based on validation
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
                {feedValid ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">RSS Feed Setup Complete!</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Your RSS feed is configured and ready to start collecting thrifting content.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-800 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">
                        {userChoice === 'proceed' && "Feed will be saved despite validation failure"}
                        {userChoice === 'inactive' && "Feed will be saved as inactive"}
                      </span>
                    </div>
                    <p className="text-amber-700 text-sm">
                      {userChoice === 'proceed' && "The feed failed validation but you chose to proceed. You can monitor and adjust settings later."}
                      {userChoice === 'inactive' && "The feed will be saved but not actively monitored. You can enable it later after resolving any issues."}
                    </p>
                  </div>
                )}

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
