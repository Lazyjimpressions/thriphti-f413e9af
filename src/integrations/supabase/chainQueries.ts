
import { supabase } from './client';
import type { Database } from './types';

// Type aliases for chain management
type StoreChain = Database['public']['Tables']['store_chains']['Row'];
type StoreChainInsert = Database['public']['Tables']['store_chains']['Insert'];
type StoreChainUpdate = Database['public']['Tables']['store_chains']['Update'];
type Store = Database['public']['Tables']['stores']['Row'];

/**
 * Creates a new store chain
 * @param chainData - The chain data to create
 * @returns Promise<StoreChain> The created chain
 */
export async function createStoreChain(chainData: StoreChainInsert): Promise<StoreChain> {
  const { data, error } = await supabase
    .from('store_chains')
    .insert(chainData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create store chain: ${error.message}`);
  return data;
}

/**
 * Gets all store chains
 * @returns Promise<StoreChain[]> Array of store chains
 */
export async function getAllStoreChains(): Promise<StoreChain[]> {
  const { data, error } = await supabase
    .from('store_chains')
    .select('*')
    .order('name');

  if (error) throw new Error(`Failed to fetch store chains: ${error.message}`);
  return data || [];
}

/**
 * Gets a store chain by ID with its locations
 * @param chainId - The chain ID
 * @returns Promise<StoreChain & { stores: Store[] }> Chain with its stores
 */
export async function getStoreChainWithLocations(chainId: string): Promise<StoreChain & { stores: Store[] }> {
  const { data, error } = await supabase
    .from('store_chains')
    .select(`
      *,
      stores (*)
    `)
    .eq('id', chainId)
    .single();

  if (error) throw new Error(`Failed to fetch store chain: ${error.message}`);
  return data as StoreChain & { stores: Store[] };
}

/**
 * Gets stores for a specific chain
 * @param chainId - The chain ID
 * @param approvedOnly - Whether to only return approved stores
 * @returns Promise<Store[]> Array of stores in the chain
 */
export async function getStoresByChain(chainId: string, approvedOnly: boolean = true): Promise<Store[]> {
  let query = supabase
    .from('stores')
    .select('*')
    .eq('chain_id', chainId);

  if (approvedOnly) {
    query = query.eq('approved', true);
  }

  const { data, error } = await query.order('location_name');

  if (error) throw new Error(`Failed to fetch stores by chain: ${error.message}`);
  return data || [];
}

/**
 * Updates a store to belong to a chain
 * @param storeId - The store ID
 * @param chainId - The chain ID
 * @param locationName - Optional location name
 * @param isflagship - Whether this is a flagship location
 * @param storeNumber - Optional store number
 * @returns Promise<Store> The updated store
 */
export async function addStoreToChain(
  storeId: string, 
  chainId: string, 
  locationName?: string,
  isFlag ship: boolean = false,
  storeNumber?: string
): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update({
      chain_id: chainId,
      location_name: locationName,
      is_flagship: isFlag ship,
      store_number: storeNumber
    })
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw new Error(`Failed to add store to chain: ${error.message}`);
  return data;
}

/**
 * Removes a store from its chain
 * @param storeId - The store ID
 * @returns Promise<Store> The updated store
 */
export async function removeStoreFromChain(storeId: string): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update({
      chain_id: null,
      location_name: null,
      is_flagship: false,
      store_number: null
    })
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw new Error(`Failed to remove store from chain: ${error.message}`);
  return data;
}

/**
 * Searches for stores by location with chain information
 * @param searchQuery - The search query
 * @param lat - Latitude for distance calculation
 * @param lng - Longitude for distance calculation
 * @returns Promise<(Store & { store_chains?: StoreChain })[]> Stores with chain info
 */
export async function searchStoresWithChains(
  searchQuery?: string,
  lat?: number,
  lng?: number
): Promise<(Store & { store_chains?: StoreChain })[]> {
  let query = supabase
    .from('stores')
    .select(`
      *,
      store_chains (*)
    `)
    .eq('approved', true);

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query.order('name');

  if (error) throw new Error(`Failed to search stores: ${error.message}`);
  return data || [];
}

/**
 * Gets nearby chain locations
 * @param chainId - The chain ID
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radiusMiles - Search radius in miles
 * @returns Promise<Store[]> Nearby stores in the chain
 */
export async function getNearbyChainLocations(
  chainId: string,
  lat: number,
  lng: number,
  radiusMiles: number = 25
): Promise<Store[]> {
  // This is a simplified version - in production you'd use PostGIS for proper distance calculations
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('chain_id', chainId)
    .eq('approved', true)
    .order('location_name');

  if (error) throw new Error(`Failed to fetch nearby chain locations: ${error.message}`);
  return data || [];
}
