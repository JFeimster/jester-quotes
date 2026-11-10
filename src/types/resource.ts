export type ResourceType = 'reference' | 'article' | 'book' | 'essay' | 'podcast' | 'organization' | 'other';
export interface ResourceEntry {
  id: string;
  slug: string;
  title: string;
  url: string;
  source_name: string;
  type: ResourceType;
  summary: string;
  tags: string[];
  verified_at: string;
  featured: boolean;
  related_trickster_ids: string[];
  related_quote_ids: string[];
}
export interface VideoEntry {
  id: string;
  slug: string;
  title: string;
  video_id: string;
  youtube_url: string;
  channel_title: string;
  summary: string;
  tags: string[];
  verified_at: string;
  featured: boolean;
  related_trickster_ids: string[];
}
