
import { supabase } from './client';
import type { Database } from './types';

// Type aliases for store management
type Store = Database['public']['Tables']['stores']['Row'];
type StoreInsert = Database['public']['Tables']['stores']['Insert'];
type StoreUpdate = Database['public']['Tables']['stores']['Update'];

/**
 * Creates a new store from AI analysis
 * @param storeData - The analyzed store data
 * @returns Promise<Store> The created store
 */
export async function createAIGeneratedStore(storeData: any): Promise<Store> {
  const storeInsert: StoreInsert = {
    name: storeData.name,
    description: storeData.description,
    category: storeData.category,
    address: storeData.address,
    city: storeData.city,
    state: storeData.state,
    zip: storeData.zip,
    phone: storeData.phone,
    website: storeData.website,
    images: storeData.images,
    approved: false, // AI-generated stores need approval
    ai_generated: true,
    confidence_score: storeData.confidence,
    ai_metadata: {
      hours: storeData.hours,
      specialties: storeData.specialties,
      priceRange: storeData.priceRange,
      features: storeData.features,
      analyzed_at: new Date().toISOString(),
    }
  };

  const { data, error } = await supabase
    .from('stores')
    .insert(storeInsert)
    .select()
    .single();

  if (error) throw new Error(`Failed to create AI-generated store: ${error.message}`);
  return data;
}

/**
 * Gets AI-generated stores pending approval
 * @returns Promise<Store[]> Array of pending AI-generated stores
 */
export async function getAIPendingStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('ai_generated', true)
    .eq('approved', false)
    .order('confidence_score', { ascending: false });

  if (error) throw new Error(`Failed to fetch AI pending stores: ${error.message}`);
  return data || [];
}

/**
 * Updates AI-generated store approval status
 * @param storeId - The store ID
 * @param approved - Whether to approve the store
 * @returns Promise<Store> The updated store
 */
export async function updateAIStoreApproval(storeId: string, approved: boolean): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update({ approved })
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update store approval: ${error.message}`);
  return data;
}

/**
 * Gets stores that need website analysis
 * @returns Promise<Store[]> Stores with websites but no AI analysis
 */
export async function getStoresNeedingAnalysis(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .not('website', 'is', null)
    .neq('website', '')
    .is('ai_generated', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch stores needing analysis: ${error.message}`);
  return data || [];
}

/**
 * Analyzes a store website URL and creates store profile
 * @param websiteUrl - The store website URL
 * @returns Promise<{success: boolean, storeId?: string, error?: string}>
 */
export async function analyzeStoreWebsite(websiteUrl: string): Promise<{
  success: boolean;
  storeId?: string;
  error?: string;
}> {
  try {
    // Call the edge function to analyze the website
    const { data, error } = await supabase.functions.invoke('analyze-store-website', {
      body: { url: websiteUrl }
    });

    if (error) throw error;

    if (!data.success) {
      return { success: false, error: data.error };
    }

    // Create the store record
    const store = await createAIGeneratedStore(data.storeData);
    
    return {
      success: true,
      storeId: store.id
    };

  } catch (error: any) {
    console.error('Website analysis failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze website'
    };
  }
}
