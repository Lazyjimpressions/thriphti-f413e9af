import { supabase } from './client';
import type { Database } from './types';

// Type aliases for content management
type ContentSource = Database['public']['Tables']['content_sources']['Row'];
type ContentSourceInsert = Database['public']['Tables']['content_sources']['Insert'];
type ContentSourceUpdate = Database['public']['Tables']['content_sources']['Update'];
type ContentPipeline = Database['public']['Tables']['content_pipeline']['Row'];

// Type for processed data structure
interface ProcessedData {
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  date?: string;
  actionable_details?: string;
}

// Type for raw data structure  
interface RawData {
  url?: string;
  title?: string;
  description?: string;
  location?: string;
}

// Type for pipeline items with source info
type ContentPipelineWithSource = ContentPipeline & {
  content_sources?: Pick<ContentSource, 'name' | 'source_type' | 'url'> | null;
};

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
 * Gets all content pipeline items with source information
 * @returns Promise<ContentPipelineWithSource[]> Array of pipeline items with source data
 */
export async function getContentPipelineItems(): Promise<ContentPipelineWithSource[]> {
  // First, get all pipeline items
  const { data: pipelineData, error: pipelineError } = await supabase
    .from('content_pipeline')
    .select('*')
    .order('created_at', { ascending: false });

  if (pipelineError) throw new Error(`Failed to fetch content pipeline items: ${pipelineError.message}`);

  if (!pipelineData || pipelineData.length === 0) {
    return [];
  }

  // Get unique source IDs
  const sourceIds = [...new Set(pipelineData.map(item => item.source_id).filter(Boolean))] as string[];
  
  let sourcesMap: Record<string, Pick<ContentSource, 'name' | 'source_type' | 'url'>> = {};
  
  if (sourceIds.length > 0) {
    // Fetch source information separately
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('content_sources')
      .select('id, name, source_type, url')
      .in('id', sourceIds);

    if (sourcesError) {
      console.warn('Failed to fetch content sources:', sourcesError.message);
    } else if (sourcesData) {
      sourcesMap = sourcesData.reduce((acc, source) => {
        acc[source.id] = {
          name: source.name,
          source_type: source.source_type,
          url: source.url
        };
        return acc;
      }, {} as Record<string, Pick<ContentSource, 'name' | 'source_type' | 'url'>>);
    }
  }

  // Combine pipeline data with source information
  const result: ContentPipelineWithSource[] = pipelineData.map(item => ({
    ...item,
    content_sources: item.source_id ? sourcesMap[item.source_id] || null : null
  }));

  return result;
}

/**
 * Updates the status of a pipeline item
 * @param id - The ID of the pipeline item
 * @param status - The new status
 * @returns Promise<ContentPipeline> The updated item
 */
export async function updatePipelineItemStatus(id: string, status: string): Promise<ContentPipeline> {
  const { data, error } = await supabase
    .from('content_pipeline')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update pipeline item status: ${error.message}`);
  return data;
}

/**
 * Publishes a pipeline item to the main content tables
 * @param id - The ID of the pipeline item to publish
 * @returns Promise<void>
 */
export async function publishPipelineItem(id: string): Promise<void> {
  console.log(`Publishing pipeline item: ${id}`);
  
  // Get the pipeline item
  const { data: pipelineItem, error: fetchError } = await supabase
    .from('content_pipeline')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Failed to fetch pipeline item:', fetchError);
    throw new Error(`Failed to fetch pipeline item: ${fetchError.message}`);
  }

  console.log('Pipeline item fetched:', pipelineItem);

  const processedData = pipelineItem.processed_data as ProcessedData;
  const rawData = pipelineItem.raw_data as RawData;
  
  if (!processedData) {
    console.error('No processed data found for item:', id);
    throw new Error('No processed data found for this item');
  }

  console.log('Processed data:', processedData);

  // Determine the content type and publish accordingly
  const category = processedData.category || pipelineItem.content_type;
  console.log('Publishing as category:', category);
  
  try {
    if (category === 'garage_sale' || category === 'estate_sale' || category === 'flea_market') {
      console.log('Publishing as event...');
      
      // Validate required event fields
      if (!processedData.title) {
        throw new Error('Event title is required');
      }

      // Publish as an event
      const eventData = {
        title: processedData.title,
        description: processedData.description || '',
        location: processedData.location || 'Dallas, TX',
        venue: processedData.location || 'Dallas, TX',
        event_date: processedData.date || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        category: category,
        neighborhood: extractNeighborhood(processedData.location || ''),
        price_range: extractPriceRange(processedData.actionable_details || ''),
        featured: false,
        source_url: rawData?.url || null
      };

      console.log('Event data to insert:', eventData);

      const { error: eventError } = await supabase
        .from('events')
        .insert(eventData);

      if (eventError) {
        console.error('Failed to insert event:', eventError);
        throw new Error(`Failed to publish event: ${eventError.message}`);
      }

      console.log('Event published successfully');
    } else {
      console.log('Publishing as article...');
      
      // Validate required article fields
      if (!processedData.title) {
        throw new Error('Article title is required');
      }

      // Publish as an article
      const articleData = {
        title: processedData.title,
        body: `${processedData.description || ''}\n\n${processedData.actionable_details || ''}`,
        excerpt: (processedData.description || '').substring(0, 200),
        slug: generateSlug(processedData.title),
        category: 'news',
        tags: [category],
        featured: false,
        published_at: new Date().toISOString(),
        author: 'Thriphti Team',
        source_url: rawData?.url || null
      };

      console.log('Article data to insert:', articleData);

      const { error: articleError } = await supabase
        .from('articles')
        .insert(articleData);

      if (articleError) {
        console.error('Failed to insert article:', articleError);
        throw new Error(`Failed to publish article: ${articleError.message}`);
      }

      console.log('Article published successfully');
    }

    // Update pipeline item status to published
    console.log('Updating pipeline item status to published...');
    const { error: updateError } = await supabase
      .from('content_pipeline')
      .update({ status: 'published' })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update pipeline status:', updateError);
      throw new Error(`Failed to update pipeline item to published: ${updateError.message}`);
    }

    console.log('Pipeline item status updated successfully');
  } catch (error: any) {
    console.error('Publishing failed:', error);
    // Re-throw with more context
    throw new Error(`Publishing failed: ${error.message}`);
  }
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

/**
 * Bulk updates the status of multiple pipeline items
 * @param ids - Array of item IDs to update
 * @param status - New status to apply
 * @returns Promise<ContentPipeline[]> The updated items
 */
export async function bulkUpdatePipelineItemStatus(ids: string[], status: string): Promise<ContentPipeline[]> {
  if (ids.length === 0) return [];
  
  const { data, error } = await supabase
    .from('content_pipeline')
    .update({ status })
    .in('id', ids)
    .select();

  if (error) throw new Error(`Failed to bulk update pipeline items: ${error.message}`);
  return data || [];
}

/**
 * Bulk deletes multiple pipeline items
 * @param ids - Array of item IDs to delete
 * @returns Promise<void>
 */
export async function bulkDeletePipelineItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  
  const { error } = await supabase
    .from('content_pipeline')
    .delete()
    .in('id', ids);

  if (error) throw new Error(`Failed to bulk delete pipeline items: ${error.message}`);
}

/**
 * Bulk publishes multiple pipeline items
 * @param ids - Array of item IDs to publish
 * @returns Promise<{success: string[], failed: Array<{id: string, error: string}>}>
 */
export async function bulkPublishPipelineItems(ids: string[]): Promise<{
  success: string[];
  failed: Array<{id: string, error: string}>;
}> {
  if (ids.length === 0) return { success: [], failed: [] };
  
  const results = {
    success: [] as string[],
    failed: [] as Array<{id: string, error: string}>
  };

  // Process items sequentially to avoid overwhelming the database
  for (const id of ids) {
    try {
      await publishPipelineItem(id);
      results.success.push(id);
    } catch (error: any) {
      results.failed.push({
        id,
        error: error.message || 'Unknown error'
      });
    }
  }

  return results;
}

// Helper functions for publishing
function extractNeighborhood(location: string): string {
  const neighborhoods = [
    'Downtown', 'Deep Ellum', 'Bishop Arts', 'Uptown', 'Oak Cliff', 
    'Trinity Groves', 'Design District', 'Highland Park', 'University Park'
  ];
  
  for (const neighborhood of neighborhoods) {
    if (location.toLowerCase().includes(neighborhood.toLowerCase())) {
      return neighborhood;
    }
  }
  return 'Other';
}

function extractPriceRange(details: string): string {
  if (details.toLowerCase().includes('free')) return 'free';
  if (details.toLowerCase().includes('$1') || details.toLowerCase().includes('under $5')) return 'under-5';
  if (details.toLowerCase().includes('$5') || details.toLowerCase().includes('$10')) return '5-15';
  if (details.toLowerCase().includes('$15') || details.toLowerCase().includes('$25')) return '15-25';
  return 'varies';
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Date.now().toString().slice(-6);
}
