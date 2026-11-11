/** UTC-only daily rotation for a static site. No time zone or server dependency. */
export function utcDayKey(input: Date | string = new Date()): string | null {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const parsed = new Date(input + 'T00:00:00.000Z');
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === input ? input : null;
  }
  const date = input instanceof Date ? input : typeof input === 'string' ? new Date(input) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0,10) : null;
}
export function dailyQuoteId(ids: readonly string[], input: Date | string = new Date()): string | null {
  const key = utcDayKey(input);
  if (!key || !ids.length) return null;
  // Calendar days since the Unix epoch; stable in every timezone.
  const day = Math.floor(Date.parse(key + 'T00:00:00.000Z') / 86_400_000);
  return ids[((day % ids.length) + ids.length) % ids.length] ?? null;
}
