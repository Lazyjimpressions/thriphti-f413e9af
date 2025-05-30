
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, FileText, X, Filter } from "lucide-react";

interface Article {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
  relevanceScore?: number;
  matchedKeywords?: string[];
}

interface RssContentPreviewProps {
  feedUrl: string;
  feedName: string;
  keywords: string[];
  neighborhoods: string[];
  onClose: () => void;
}

export default function RssContentPreview({ 
  feedUrl, 
  feedName, 
  keywords, 
  neighborhoods, 
  onClose 
}: RssContentPreviewProps) {
  const [testing, setTesting] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const testContentExtraction = async () => {
    setTesting(true);
    setArticles([]);
    setFilteredArticles([]);

    try {
      console.log('Testing RSS content extraction:', feedUrl);
      
      // First validate and get feed content
      const { data, error } = await supabase.functions.invoke('validate-rss-feed', {
        body: { url: feedUrl }
      });

      if (error || !data.isValid) {
        throw new Error(data?.error || 'Failed to fetch RSS feed');
      }

      const allArticles = data.items || [];
      setTotalCount(allArticles.length);
      setArticles(allArticles);

      // Simulate content filtering based on keywords
      const filtered = allArticles.filter((article: Article) => {
        const content = `${article.title} ${article.description}`.toLowerCase();
        
        // Check for thrift-related keywords
        const matchedKeywords = keywords.filter(keyword => 
          content.includes(keyword.toLowerCase())
        );

        // Check for neighborhood mentions
        const matchedNeighborhoods = neighborhoods.filter(neighborhood =>
          content.includes(neighborhood.toLowerCase())
        );

        if (matchedKeywords.length > 0 || matchedNeighborhoods.length > 0) {
          return {
            ...article,
            relevanceScore: matchedKeywords.length * 2 + matchedNeighborhoods.length,
            matchedKeywords: [...matchedKeywords, ...matchedNeighborhoods]
          };
        }

        return false;
      }).map((article: Article) => {
        const content = `${article.title} ${article.description}`.toLowerCase();
        const matchedKeywords = keywords.filter(keyword => 
          content.includes(keyword.toLowerCase())
        );
        const matchedNeighborhoods = neighborhoods.filter(neighborhood =>
          content.includes(neighborhood.toLowerCase())
        );

        return {
          ...article,
          relevanceScore: matchedKeywords.length * 2 + matchedNeighborhoods.length,
          matchedKeywords: [...matchedKeywords, ...matchedNeighborhoods]
        };
      });

      setFilteredArticles(filtered);

      toast({
        title: "Content Analysis Complete",
        description: `Found ${filtered.length} potentially relevant articles out of ${allArticles.length} total`
      });

    } catch (error: any) {
      console.error('RSS content extraction error:', error);
      toast({
        title: "Content Extraction Failed",
        description: error.message || "Failed to analyze RSS feed content",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-green-50 p-4 border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Content Preview: {feedName}
        </h4>
        <Button onClick={onClose} variant="outline" size="sm">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={testContentExtraction} disabled={testing} size="sm">
          {testing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Analyzing Content...
            </>
          ) : (
            <>
              <FileText className="h-3 w-3 mr-1" />
              Test Content Filtering
            </>
          )}
        </Button>
      </div>

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span>Total Articles: {totalCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Relevant: {filteredArticles.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-gray-500" />
              <span>Filtered Out: {totalCount - filteredArticles.length}</span>
            </div>
          </div>
        </div>
      )}

      {filteredArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Potentially Relevant Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredArticles.slice(0, 5).map((article, index) => (
                <div key={index} className="bg-white border rounded p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-700 mb-1">{article.title}</p>
                      {article.description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                          {article.description.substring(0, 150)}...
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{formatDate(article.pubDate)}</span>
                        {article.relevanceScore && (
                          <Badge variant="outline" className="text-xs">
                            Relevance: {article.relevanceScore}
                          </Badge>
                        )}
                      </div>
                      {article.matchedKeywords && article.matchedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.matchedKeywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredArticles.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  And {filteredArticles.length - 5} more relevant articles...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {totalCount > 0 && filteredArticles.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-200 rounded p-3 text-sm">
          <p className="text-yellow-800">
            No articles matched your thrift-related keywords. You may want to:
          </p>
          <ul className="list-disc list-inside mt-2 text-yellow-700 text-xs">
            <li>Add more general keywords (shopping, retail, local business)</li>
            <li>Check if this feed covers topics relevant to thrifting</li>
            <li>Adjust your keyword strategy</li>
          </ul>
        </div>
      )}
    </div>
  );
}
