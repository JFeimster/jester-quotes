import type { Quote } from '../types/quote';
export type SavedSort = 'recent' | 'original' | 'author';
export const MAX_SHARE_PACK_QUOTES = 5;
export function validateFavoritesImport(raw: string, known: ReadonlySet<string>): string[] {
  if (raw.length > 65536) throw new Error('This JSON file is larger than the 64 KB import limit.');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Invalid JSON. No saved quotes were changed.'); }
  const ids: unknown = Array.isArray(parsed) ? parsed :
    parsed !== null && typeof parsed === 'object' && 'version' in parsed && 'quote_ids' in parsed &&
    (parsed as {version:unknown}).version === 1 ? (parsed as {quote_ids:unknown}).quote_ids : null;
  if (!Array.isArray(ids)) throw new Error('Expected a version 1 favorites export or an array of quote IDs.');
  if (ids.length > known.size) throw new Error('The file contains more quotations than the registry.');
  if (!ids.every(id => typeof id === 'string' && known.has(id))) throw new Error('The file includes an unknown or invalid quote ID.');
  if (new Set(ids).size !== ids.length) throw new Error('The file includes duplicate quote IDs.');
  return ids as string[];
}
export function exportFavorites(ids: readonly string[], known: ReadonlySet<string>, now: Date = new Date()): string {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid export timestamp.');
  if (ids.some(id => !known.has(id)) || new Set(ids).size !== ids.length) {
    throw new Error('Cannot export invalid saved quotation IDs.');
  }
  return JSON.stringify({ version:1, exported_at: now.toISOString(), quote_ids: ids }, null, 2) + '\n';
}
export function filterSavedQuotes(quotes: readonly Quote[], saved: ReadonlySet<string>, query: string, sort: SavedSort): Quote[] {
  const q = query.trim().toLocaleLowerCase();
  const selected = quotes.filter(quote => saved.has(quote.id) &&
    (!q || `${quote.quote} ${quote.person} ${quote.reference ?? ''}`.toLocaleLowerCase().includes(q)));
  const original = new Map(quotes.map((quote,index)=>[quote.id,index]));
  if (sort === 'recent') {
    const order = new Map([...saved].map((id,index)=>[id,index]));
    selected.sort((a,b)=>(order.get(b.id) ?? -1)-(order.get(a.id) ?? -1));
  } else if (sort === 'author') {
    selected.sort((a,b)=>a.person.localeCompare(b.person) || (original.get(a.id) ?? 0)-(original.get(b.id) ?? 0));
  } else {
    selected.sort((a,b)=>(original.get(a.id) ?? 0)-(original.get(b.id) ?? 0));
  }
  return selected;
}
