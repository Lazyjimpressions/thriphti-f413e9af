
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, ExternalLink, Settings, Trash2, Play, Pause } from "lucide-react";

interface ContentSource {
  id: number;
  name: string;
  type: string;
  url: string;
  active: boolean;
  geographic_focus: string;
  keywords: string;
  last_checked: string;
  status: string;
  items_found: number;
  items_processed: number;
}

interface SourceListProps {
  sources: ContentSource[];
}

export function SourceList({ sources }: SourceListProps) {
  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'rss_feed': return 'RSS Feed';
      case 'email_alert': return 'Email Alert';
      case 'api': return 'API';
      default: return type;
    }
  };

  const getStatusBadge = (status: string, active: boolean) => {
    if (!active) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (sources.length === 0) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Sources</h3>
        <p className="text-gray-500 mb-4">
          Get started by adding your first content source to begin processing Dallas thrifting content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <Card key={source.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{source.name}</h3>
                  {getStatusBadge(source.status, source.active)}
                  <Badge variant="outline">{getSourceTypeLabel(source.type)}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">
                      <strong>URL:</strong> 
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {source.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Geographic Focus:</strong> {source.geographic_focus || 'Not specified'}
                    </p>
                    <p className="text-gray-600">
                      <strong>Keywords:</strong> {source.keywords || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-1">
                      <strong>Last Checked:</strong> {new Date(source.last_checked).toLocaleString()}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Items Found:</strong> {source.items_found}
                    </p>
                    <p className="text-gray-600">
                      <strong>Items Processed:</strong> {source.items_processed}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm">
                  {source.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
