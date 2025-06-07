
import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface ScrapeResponse {
  success: true;
  data: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description: string;
      language: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
    };
    links: string[];
  };
}

type FirecrawlResponse = ScrapeResponse | ErrorResponse;

export class FirecrawlService {
  private static firecrawlApp: FirecrawlApp | null = null;

  static initialize(apiKey: string): void {
    this.firecrawlApp = new FirecrawlApp({ apiKey });
  }

  static async scrapeWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!this.firecrawlApp) {
      return { success: false, error: 'Firecrawl not initialized. API key required.' };
    }

    try {
      console.log('Scraping website:', url);
      
      const response = await this.firecrawlApp.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'div', 'span', 'address'],
        excludeTags: ['script', 'style', 'nav', 'footer', 'header'],
        onlyMainContent: true,
      }) as FirecrawlResponse;

      if (!response.success) {
        console.error('Scrape failed:', (response as ErrorResponse).error);
        return { 
          success: false, 
          error: (response as ErrorResponse).error || 'Failed to scrape website' 
        };
      }

      console.log('Scrape successful');
      return { 
        success: true,
        data: (response as ScrapeResponse).data 
      };
    } catch (error) {
      console.error('Error during scrape:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }

  static async testConnection(): Promise<boolean> {
    if (!this.firecrawlApp) return false;
    
    try {
      // Test with a simple, reliable website
      const response = await this.firecrawlApp.scrapeUrl('https://example.com', {
        formats: ['markdown'],
        onlyMainContent: true,
      });
      return response.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
