export interface Quote {
  id: string;
  name: string;
  person: string;
  reference: string | null;
  quote: string;
}
export interface QuoteRegistry {
  id: string;
  name: string;
  description: string;
  source: { type: string; name: string; url?: string };
  items: Quote[];
}
