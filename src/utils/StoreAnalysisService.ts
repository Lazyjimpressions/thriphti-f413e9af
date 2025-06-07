
interface StoreAnalysisResult {
  success: boolean;
  error?: string;
  data?: {
    name: string;
    description: string;
    category: string[];
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    website?: string;
    hours?: Record<string, { open: string; close: string }>;
    specialties?: string[];
    priceRange?: string;
    features?: string[];
    confidence: number;
    images?: string[];
  };
}

export class StoreAnalysisService {
  private static OPENAI_API_KEY: string | null = null;

  static initialize(apiKey: string): void {
    this.OPENAI_API_KEY = apiKey;
  }

  static async analyzeStoreContent(scrapedData: any, originalUrl: string): Promise<StoreAnalysisResult> {
    if (!this.OPENAI_API_KEY) {
      return { success: false, error: 'OpenAI API key not configured' };
    }

    try {
      const prompt = this.buildAnalysisPrompt(scrapedData, originalUrl);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing thrift store, consignment shop, and vintage store websites. Extract structured information and return valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      // Parse the JSON response
      const analysisData = JSON.parse(content);
      
      // Validate the store is in Dallas-Fort Worth area
      if (!this.isDallasArea(analysisData.city, analysisData.state)) {
        return {
          success: false,
          error: 'Store is not located in the Dallas-Fort Worth metroplex'
        };
      }

      return {
        success: true,
        data: analysisData
      };

    } catch (error) {
      console.error('Store analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  private static buildAnalysisPrompt(scrapedData: any, url: string): string {
    return `
Analyze this thrift/consignment/vintage store website and extract structured information. 
Website URL: ${url}
Website Title: ${scrapedData.metadata?.title || 'Unknown'}
Website Description: ${scrapedData.metadata?.description || 'None'}

Content:
${scrapedData.markdown}

Extract and return ONLY valid JSON with this exact structure:
{
  "name": "Store name",
  "description": "Compelling 2-3 sentence description highlighting what makes this store unique",
  "category": ["thrift", "consignment", "vintage", "designer", "furniture", "books", "clothing"],
  "address": "Street address",
  "city": "City name",
  "state": "State abbreviation",
  "zip": "ZIP code",
  "phone": "Phone number",
  "website": "${url}",
  "hours": {
    "monday": {"open": "09:00", "close": "18:00"},
    "tuesday": {"open": "09:00", "close": "18:00"}
  },
  "specialties": ["vintage clothing", "designer items", "furniture", "books"],
  "priceRange": "budget-friendly",
  "features": ["large selection", "frequent sales", "accepts donations"],
  "confidence": 0.85,
  "images": ["url1", "url2"]
}

Rules:
- Only include stores in Texas, preferably Dallas-Fort Worth area
- Categories: choose from thrift, consignment, vintage, designer, furniture, books, clothing, accessories
- Hours: use 24-hour format (HH:MM), only include days found on website
- Confidence: 0.0-1.0 based on information completeness
- Description: focus on unique aspects, specialties, and what shoppers can expect
- Extract any images from the website content
- If critical information is missing, use null but maintain JSON structure
`;
  }

  private static isDallasArea(city?: string, state?: string): boolean {
    if (!city || !state) return false;
    
    if (state.toLowerCase() !== 'tx' && state.toLowerCase() !== 'texas') {
      return false;
    }

    const dallasAreaCities = [
      'dallas', 'fort worth', 'arlington', 'plano', 'garland', 'irving', 'grand prairie',
      'mesquite', 'carrollton', 'richardson', 'lewisville', 'allen', 'flower mound',
      'frisco', 'mckinney', 'denton', 'euless', 'bedford', 'grapevine', 'southlake',
      'colleyville', 'keller', 'coppell', 'farmers branch', 'university park',
      'highland park', 'addison', 'cedar hill', 'desoto', 'duncanville', 'lancaster',
      'rowlett', 'wylie', 'rockwall', 'murphy', 'sachse', 'balch springs'
    ];

    return dallasAreaCities.some(dallasCity => 
      city.toLowerCase().includes(dallasCity) || dallasCity.includes(city.toLowerCase())
    );
  }
}
