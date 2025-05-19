import { supabase } from './client';
import type { Database } from '@/types/supabase';
import { Event } from '@/types/event';

// Type aliases for better readability
type Store = Database['public']['Tables']['stores']['Row'];
type StoreInsert = Database['public']['Tables']['stores']['Insert'];
type StoreReview = Database['public']['Tables']['store_reviews']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Article = Database['public']['Tables']['articles']['Row'];
type DbEvent = Database['public']['Tables']['events']['Row'];

/**
 * Fetches all approved stores
 * @returns Promise<Store[]> Array of approved stores
 * @throws Error if the query fails
 */
export async function getApprovedStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('approved', true);

  if (error) throw new Error(`Failed to fetch approved stores: ${error.message}`);
  return data;
}

/**
 * Fetches a store by ID with its reviews
 * @param storeId - The ID of the store to fetch
 * @returns Promise<Store & { store_reviews: (StoreReview & { profiles: Pick<Profile, 'full_name'> })[] }>
 * @throws Error if the query fails
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

  if (error) throw new Error(`Failed to fetch store with reviews: ${error.message}`);
  return data as Store & {
    store_reviews: (StoreReview & {
      profiles: Pick<Profile, 'full_name'>;
    })[];
  };
}

/**
 * Submits a new store for approval
 * @param store - The store data to submit
 * @returns Promise<Store> The created store
 * @throws Error if the submission fails
 */
export async function submitNewStore(store: Omit<StoreInsert, 'id' | 'approved' | 'created_at'>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      ...store,
      approved: false,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to submit new store: ${error.message}`);
  return data;
}

/**
 * Adds a review to a store
 * @param review - The review data
 * @param userId - The ID of the user submitting the review
 * @returns Promise<StoreReview> The created review
 * @throws Error if the submission fails
 */
export async function addStoreReview(
  review: Omit<StoreReview, 'id' | 'created_at'>,
  userId: string
): Promise<StoreReview> {
  const { data, error } = await supabase
    .from('store_reviews')
    .insert({
      ...review,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add store review: ${error.message}`);
  return data;
}

/**
 * Fetches all articles
 * @returns Promise<Article[]> Array of articles
 * @throws Error if the query fails
 */
export async function getAllArticles(): Promise<Article[]> {
  console.log("Fetching articles from Supabase");
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('publishedat', { ascending: false });
    
    if (error) {
      console.error("Supabase error details:", error);
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }
    
    console.log("Articles fetched successfully:", data?.length || 0);
    return data || [];
  } catch (e: any) {
    console.error("Exception in getAllArticles:", e);
    throw new Error(`Failed to fetch articles: ${e.message}`);
  }
}

/**
 * Fetches a single article by slug
 * @param slug - The slug of the article to fetch
 * @returns Promise<Article> The article
 * @throws Error if the query fails
 */
export async function getArticleBySlug(slug: string): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw new Error(`Failed to fetch article: ${error.message}`);
  return data;
}

/**
 * Fetches a store by ID
 * @param storeId - The ID of the store to fetch
 * @returns Promise<Store> The store
 * @throws Error if the query fails
 */
export async function getStoreById(storeId: string): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();
  
  if (error) throw new Error(`Failed to fetch store: ${error.message}`);
  return data;
}

/**
 * Fetches reviews for a store, including user profile names
 * @param storeId - The ID of the store to fetch reviews for
 * @returns Promise<(StoreReview & { profiles: { full_name: string | null } })[]> Array of reviews
 * @throws Error if the query fails
 */
export async function getStoreReviews(storeId: string): Promise<(StoreReview & { profiles: { full_name: string | null } })[]> {
  const { data, error } = await supabase
    .from('store_reviews')
    .select('*, profiles(full_name)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(`Failed to fetch store reviews: ${error.message}`);
  return data;
}

// EVENT-RELATED FUNCTIONS

/**
 * Fetches featured events
 * @returns Promise<Event[]> Array of featured events
 * @throws Error if the query fails
 */
export async function getFeaturedEvents(): Promise<Event[]> {
  console.log("Fetching featured events from Supabase");
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('featured', true)
      .order('event_date', { ascending: true });
    
    if (error) {
      console.error("Supabase error details:", error);
      throw new Error(`Failed to fetch featured events: ${error.message}`);
    }
    
    console.log("Featured events fetched successfully:", data?.length || 0);
    return data as Event[] || [];
  } catch (e: any) {
    console.error("Exception in getFeaturedEvents:", e);
    throw new Error(`Failed to fetch featured events: ${e.message}`);
  }
}

/**
 * Fetches events by day for a specific date range
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @returns Promise<Event[]> Array of events with day of week
 * @throws Error if the query fails
 */
export async function getEventsByDay(startDate: string, endDate: string): Promise<Event[]> {
  console.log(`Fetching events from ${startDate} to ${endDate}`);
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error("Supabase error details:", error);
      throw new Error(`Failed to fetch events by day: ${error.message}`);
    }
    
    // Format the data to include day_of_week
    const eventsWithDayOfWeek = data?.map(event => ({
      ...event,
      day_of_week: new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long' })
    })) || [];
    
    console.log("Events by day fetched successfully:", eventsWithDayOfWeek.length);
    return eventsWithDayOfWeek as Event[];
  } catch (e: any) {
    console.error("Exception in getEventsByDay:", e);
    throw new Error(`Failed to fetch events by day: ${e.message}`);
  }
}

/**
 * Filters events based on various criteria
 * @param options - Filter options
 * @returns Promise<Event[]> Array of filtered events
 * @throws Error if the query fails
 */
export async function filterEvents({
  categories = null,
  neighborhoods = null,
  priceRanges = null,
  searchQuery = null,
  date = null
}: {
  categories?: string[] | null;
  neighborhoods?: string[] | null;
  priceRanges?: string[] | null;
  searchQuery?: string | null;
  date?: string | null;
}): Promise<Event[]> {
  let queryBuilder = supabase
    .from('events')
    .select('*');
  
  // Apply filters
  if (categories && categories.length > 0) {
    queryBuilder = queryBuilder.in('category', categories);
  }
  
  if (neighborhoods && neighborhoods.length > 0) {
    queryBuilder = queryBuilder.in('neighborhood', neighborhoods);
  }
  
  if (priceRanges && priceRanges.length > 0) {
    queryBuilder = queryBuilder.in('price_range', priceRanges);
  }
  
  if (searchQuery) {
    queryBuilder = queryBuilder.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,venue.ilike.%${searchQuery}%`);
  }
  
  if (date) {
    queryBuilder = queryBuilder.eq('event_date', date);
  }
  
  // Order by date and featured status
  queryBuilder = queryBuilder.order('event_date', { ascending: true }).order('featured', { ascending: false });
  
  const { data, error } = await queryBuilder;
  
  if (error) throw new Error(`Failed to filter events: ${error.message}`);
  return data as Event[] || [];
}
