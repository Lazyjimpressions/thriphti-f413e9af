import OpenAI from 'openai';

interface StoreData {
  name: string;
  description: string;
  category: string[];
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  images: string[];
  hours: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  specialties: string[];
  priceRange: string;
  features: string[];
  confidence: number;
}

interface ChainAnalysisResult {
  isChain: boolean;
  chainName?: string;
  chainInfo?: {
    description: string;
    website: string;
    headquartersLocation?: string;
    estimatedLocations?: number;
  };
  locations?: Array<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip?: string;
    phone?: string;
  }>;
}

export class StoreAnalysisService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Basic website content extraction using OpenAI
   */
  async extractContent(url: string): Promise<string | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a website content extractor. Extract all the text content from the website, including metadata, but exclude navigation, headers, and footers.'
          },
          {
            role: 'user',
            content: `Extract content from: ${url}`
          }
        ],
        temperature: 0.2,
        max_tokens: 3500
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Content extraction failed:', error);
      return null;
    }
  }

  /**
   * Analyzes a website to extract store information
   */
  async analyzeStoreWebsite(url: string, content: string): Promise<StoreData> {
    const analysisPrompt = `
    Analyze this website content to extract store information:

    Website Content:
    ${content.substring(0, 8000)}

    Extract and respond with a JSON object containing:
    {
      "name": string, // Store name
      "description": string, // Short store description
      "category": string[], // Array of categories (thrift, consignment, vintage, etc.)
      "address": string, // Street address
      "city": string,
      "state": string,
      "zip": string,
      "phone": string,
      "website": string, // Store website URL
      "images": string[], // Array of image URLs
      "hours": { // Store hours for each day
        "Monday": { "open": string, "close": string },
        "Tuesday": { "open": string, "close": string },
        "Wednesday": { "open": string, "close": string },
        "Thursday": { "open": string, "close": string },
        "Friday": { "open": string, "close": string },
        "Saturday": { "open": string, "close": string },
        "Sunday": { "open": string, "close": string }
      },
      "specialties": string[], // Array of store specialties
      "priceRange": string, // Price range ($, $$, $$$, etc.)
      "features": string[], // Array of store features (free parking, wheelchair accessible, etc.)
      "confidence": number // Confidence score (0-1)
    }

    If a field cannot be determined, leave it blank.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting store information from websites. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis received from OpenAI');
      }

      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      const storeData = JSON.parse(cleanedText) as StoreData;

      // Basic confidence score based on completeness
      let confidence = 0.7;
      if (!storeData.description) confidence -= 0.1;
      if (!storeData.phone) confidence -= 0.05;
      if (!storeData.address) confidence -= 0.15;
      storeData.confidence = Math.max(0, Math.min(1, confidence));

      return storeData;

    } catch (error) {
      console.error('Store analysis failed:', error);
      throw new Error('Failed to analyze store website');
    }
  }

  /**
   * Analyzes if a website represents a chain store and extracts chain information
   */
  async analyzeChainInformation(content: string, url: string): Promise<ChainAnalysisResult> {
    const chainAnalysisPrompt = `
    Analyze this website content to determine if it represents a chain store with multiple locations:

    Website Content:
    ${content.substring(0, 8000)}

    Analyze and respond with a JSON object containing:
    {
      "isChain": boolean, // true if this appears to be a chain with multiple locations
      "chainName": string, // the chain name if it's a chain
      "chainInfo": {
        "description": string, // description of the chain/organization
        "website": string, // main website URL
        "headquartersLocation": string, // city, state of headquarters if mentioned
        "estimatedLocations": number // estimated number of locations if mentioned
      },
      "locations": [ // array of individual locations if found
        {
          "name": string, // location name/identifier
          "address": string, // street address
          "city": string,
          "state": string,
          "zip": string,
          "phone": string
        }
      ]
    }

    Look for:
    - Store locator pages or location lists
    - Multiple addresses mentioned
    - "Locations", "Find a Store", "Store Directory" sections
    - Corporate information suggesting multiple locations
    - Phrases like "all locations", "visit our stores", etc.

    If it's a single location, set isChain to false and omit chainInfo and locations.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing retail websites to identify chain stores and extract location information. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: chainAnalysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis received from OpenAI');
      }

      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedText) as ChainAnalysisResult;

      return analysis;

    } catch (error) {
      console.error('Chain analysis failed:', error);
      return {
        isChain: false
      };
    }
  }

  /**
   * Enhanced store analysis that includes chain detection
   */
  async analyzeStoreWebsiteWithChain(url: string, content: string): Promise<{
    storeData: any;
    chainAnalysis: ChainAnalysisResult;
  }> {
    const [storeData, chainAnalysis] = await Promise.all([
      this.analyzeStoreWebsite(url, content),
      this.analyzeChainInformation(content, url)
    ]);

    return {
      storeData,
      chainAnalysis
    };
  }
}
