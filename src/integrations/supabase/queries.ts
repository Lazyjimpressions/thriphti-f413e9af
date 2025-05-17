import { supabase } from './client';
import type { Database } from '@/types/supabase';

// Type aliases for better readability
type Store = Database['public']['Tables']['stores']['Row'];
type StoreInsert = Database['public']['Tables']['stores']['Insert'];
type StoreReview = Database['public']['Tables']['store_reviews']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Fetches all approved stores
 */
export async function getApprovedStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('approved', true);

  if (error) throw error;
  return data as Store[];
}

/**
 * Fetches a store by ID with its reviews
 */
export async function getStoreWithReviews(storeId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      store_reviews (
        *,
        profiles (
          full_name
        )
      )
    `)
    .eq('id', storeId)
    .single();

  if (error) throw error;
  return data as Store & {
    store_reviews: (StoreReview & {
      profiles: Pick<Profile, 'full_name'>;
    })[];
  };
}

/**
 * Submits a new store for approval
 */
export async function submitNewStore(store: Omit<StoreInsert, 'id' | 'approved' | 'created_at'>) {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      ...store,
      approved: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Store;
}

/**
 * Adds a review to a store
 */
export async function addStoreReview(
  review: Omit<StoreReview, 'id' | 'created_at'>,
  userId: string
) {
  const { data, error } = await supabase
    .from('store_reviews')
    .insert({
      ...review,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as StoreReview;
}

/**
 * Fetches all articles
 */
export async function getAllArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('publishedat', { ascending: false });
  if (error) throw error;
  return data as Database['public']['Tables']['articles']['Row'][];
}

/**
 * Fetches a single article by slug
 */
export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as Database['public']['Tables']['articles']['Row'];
}

/**
 * Fetches a store by ID
 */
export async function getStoreById(storeId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();
  if (error) throw error;
  return data as Database['public']['Tables']['stores']['Row'];
}

/**
 * Fetches reviews for a store, including user profile names
 */
export async function getStoreReviews(storeId: string) {
  const { data, error } = await supabase
    .from('store_reviews')
    .select('*, profiles(full_name)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as (Database['public']['Tables']['store_reviews']['Row'] & { profiles: { full_name: string | null } })[];
} 