export type TricksterKind = 'folklore' | 'deity' | 'culture-hero' | 'literary';
export type TricksterMedium = 'oral-tradition' | 'mythology' | 'literature';
export interface TricksterSource {
  publisher: string;
  title: string;
  url: string;
}
export interface Trickster {
  id: string;
  slug: string;
  name: string;
  kind: TricksterKind;
  media: TricksterMedium[];
  tags: string[];
  culture_or_origin: string;
  description: string;
  source_list_number: number | null;
  sources: TricksterSource[];
  related_collection_slugs: string[];
  verification_status: 'verified';
  verified_at: string;
  image: null | {
    src: string; credit: string; license: string; source_url: string;
  };
}
