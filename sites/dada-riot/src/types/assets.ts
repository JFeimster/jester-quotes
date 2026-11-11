export type AssetStatus = 'planned' | 'generated' | 'approved' | 'uploaded' | 'integrated' | 'archived';
export type AssetVariant = 'clean' | 'editorial' | 'light' | 'dark' | 'horizontal' | 'vertical' | 'square' | 'cover' | 'source' | 'optimized' | 'alternate';
export type AssetType = 'logo' | 'avatar' | 'profile' | 'favicon' | 'icon' | 'hero' | 'banner' | 'thumbnail' | 'background' | 'illustration' | 'featured' | 'collection-cover' | 'social-post' | 'social-story' | 'carousel-slide' | 'reel-cover' | 'video-thumbnail' | 'studio-template' | 'studio-mockup' | 'studio-promo' | 'resource-asset' | 'theme-art' | 'video-poster' | 'social-preview';
export type AssetAspectRatio = '1x1' | '4x3' | '4x5' | '3x4' | '16x9' | '9x16' | '21x9' | '191x100';
export interface AssetDimensions { width: number; height: number }
export interface AssetRecord {
  id: string; path: string; assetType: AssetType; style: string; status: AssetStatus;
  collection?: string; variant?: AssetVariant; aspectRatio?: AssetAspectRatio;
  dimensions?: AssetDimensions; mimeType?: string; usage?: string[];
  alt?: string; source?: string; license?: string; notes?: string;
}
export type AssetFilter = Partial<Pick<AssetRecord, 'assetType' | 'style' | 'collection' | 'variant' | 'aspectRatio' | 'status'>>;
