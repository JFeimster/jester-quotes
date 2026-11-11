import rawAssets from '../data/image-assets.json';
import type { AssetFilter, AssetRecord } from '../types/assets';
const records = rawAssets as AssetRecord[];
const byId = new Map(records.map((asset) => [asset.id, asset]));
export const imageAssets: readonly AssetRecord[] = records;
/** Lookup includes planned records; does not prove physical availability. */
export function getAsset(id: string): AssetRecord | undefined { return byId.get(id); }
export function findAssets(filter: AssetFilter = {}): AssetRecord[] {
  return records.filter((asset) => (Object.entries(filter) as Array<[keyof AssetFilter, string]>).every(([key, value]) => asset[key] === value));
}
/** Do not resolve unuploaded artwork. */
export function resolveAssetPath(id: string): string | undefined {
  const asset = getAsset(id);
  return asset && (asset.status === 'uploaded' || asset.status === 'integrated') ? asset.path : undefined;
}
export function selectAsset(filter: AssetFilter): AssetRecord | undefined {
  const candidates = findAssets(filter).filter((asset) => asset.status === 'integrated' || asset.status === 'uploaded');
  return candidates.find((asset) => asset.status === 'integrated') ?? candidates[0];
}
