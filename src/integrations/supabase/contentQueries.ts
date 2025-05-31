
import { supabase } from './client';
import type { Database } from './types';

// Type aliases for content management
type ContentSource = Database['public']['Tables']['content_sources']['Row'];
type ContentSourceInsert = Database['public']['Tables']['content_sources']['Insert'];
type ContentSourceUpdate = Database['public']['Tables']['content_sources']['Update'];
type ContentPipeline = Database['public']['Tables']['content_pipeline']['Row'];

/**
 * Fetches all content sources
 * @returns Promise<ContentSource[]> Array of content sources
 * @throws Error if the query fails
 */
export async function getContentSources(): Promise<ContentSource[]> {
  const { data, error } = await supabase
    .from('content_sources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch content sources: ${error.message}`);
  return data || [];
}

/**
 * Creates a new content source
 * @param source - The source data to create
 * @returns Promise<ContentSource> The created source
 * @throws Error if the creation fails
 */
export async function createContentSource(source: ContentSourceInsert): Promise<ContentSource> {
  const { data, error } = await supabase
    .from('content_sources')
    .insert(source)
    .select()
    .single();

  if (error) throw new Error(`Failed to create content source: ${error.message}`);
  return data;
}

/**
 * Updates a content source
 * @param id - The ID of the source to update
 * @param updates - The updates to apply
 * @returns Promise<ContentSource> The updated source
 * @throws Error if the update fails
 */
export async function updateContentSource(id: string, updates: ContentSourceUpdate): Promise<ContentSource> {
  const { data, error } = await supabase
    .from('content_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update content source: ${error.message}`);
  return data;
}

/**
 * Deletes a content source
 * @param id - The ID of the source to delete
 * @returns Promise<void>
 * @throws Error if the deletion fails
 */
export async function deleteContentSource(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_sources')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete content source: ${error.message}`);
}

/**
 * Toggles the active status of a content source
 * @param id - The ID of the source to toggle
 * @returns Promise<ContentSource> The updated source
 * @throws Error if the update fails
 */
export async function toggleContentSourceActive(id: string): Promise<ContentSource> {
  // First get the current state
  const { data: currentSource, error: fetchError } = await supabase
    .from('content_sources')
    .select('active')
    .eq('id', id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch current source state: ${fetchError.message}`);

  // Toggle the active state
  return updateContentSource(id, { active: !currentSource.active });
}

/**
 * Tests an RSS feed URL and validates it
 * @param url - The RSS feed URL to test
 * @returns Promise<{isValid: boolean, error?: string, title?: string, itemCount?: number}>
 */
export async function testRSSFeed(url: string): Promise<{
  isValid: boolean;
  error?: string;
  title?: string;
  itemCount?: number;
  description?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('test-rss-feed', {
      body: { url }
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Failed to test RSS feed'
    };
  }
}

/**
 * Triggers content processing for a specific source
 * @param sourceId - The ID of the source to process
 * @returns Promise<void>
 */
export async function triggerSourceProcessing(sourceId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('process-content-source', {
    body: { sourceId }
  });

  if (error) throw new Error(`Failed to trigger source processing: ${error.message}`);
}

/**
 * Gets content pipeline items for a source
 * @param sourceId - The ID of the source
 * @returns Promise<ContentPipeline[]> Array of pipeline items
 */
export async function getContentPipelineBySource(sourceId: string): Promise<ContentPipeline[]> {
  const { data, error } = await supabase
    .from('content_pipeline')
    .select('*')
    .eq('source_id', sourceId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch content pipeline: ${error.message}`);
  return data || [];
}

/**
 * Gets overall content pipeline statistics
 * @returns Promise<{total: number, pending: number, processed: number, published: number}>
 */
export async function getContentPipelineStats(): Promise<{
  total: number;
  pending: number;
  processed: number;
  published: number;
}> {
  const { data, error } = await supabase
    .from('content_pipeline')
    .select('status');

  if (error) throw new Error(`Failed to fetch pipeline stats: ${error.message}`);

  const stats = data?.reduce((acc, item) => {
    acc.total++;
    switch (item.status) {
      case 'pending':
        acc.pending++;
        break;
      case 'processed':
        acc.processed++;
        break;
      case 'published':
        acc.published++;
        break;
    }
    return acc;
  }, { total: 0, pending: 0, processed: 0, published: 0 }) || { total: 0, pending: 0, processed: 0, published: 0 };

  return stats;
}
