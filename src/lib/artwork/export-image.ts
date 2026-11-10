export interface NamedImage { name: string; blob: Blob }

const utf8 = new TextEncoder();
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function header(bytes: number, writer: (view: DataView) => void): Uint8Array {
  const out = new Uint8Array(bytes);
  writer(new DataView(out.buffer));
  return out;
}
export async function makeUncompressedZip(items: NamedImage[]): Promise<Blob> {
  if (!items.length || items.length > 65535) throw new RangeError('Invalid ZIP file count');
  const records: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const item of items) {
    const data = new Uint8Array(await item.blob.arrayBuffer());
    const name = utf8.encode(item.name);
    if (data.length > 0xffffffff || name.length > 65535) throw new RangeError('ZIP entry exceeds size limits');
    const crc = crc32(data);
    const local = header(30, view => {
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0x0800, true); // UTF-8 names
      view.setUint16(8, 0, true); // PNGs already compressed; ZIP store
      view.setUint32(14, crc, true);
      view.setUint32(18, data.length, true);
      view.setUint32(22, data.length, true);
      view.setUint16(26, name.length, true);
    });
    records.push(local, name, data);
    const dir = header(46, view => {
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0x0800, true);
      view.setUint32(16, crc, true);
      view.setUint32(20, data.length, true);
      view.setUint32(24, data.length, true);
      view.setUint16(28, name.length, true);
      view.setUint32(42, offset, true);
    });
    central.push(dir, name);
    offset += local.length + name.length + data.length;
  }
  const directorySize = central.reduce((n, b) => n + b.length, 0);
  const footer = header(22, view => {
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, items.length, true);
    view.setUint16(10, items.length, true);
    view.setUint32(12, directorySize, true);
    view.setUint32(16, offset, true);
  });
  return new Blob([...records, ...central, footer].map(part => new Uint8Array(part).buffer), { type: 'application/zip' });
}
function pngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG canvas export was blocked')), 'image/png');
    } catch (error) { reject(error); }
  });
}
function deliver(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 7000);
}
export async function downloadArtwork(
  canvas: HTMLCanvasElement,
  pageCount: number,
  basename: string,
  renderPage: (pageIndex: number) => void,
  onProgress?: (message: string) => void
): Promise<'png' | 'zip'> {
  const files: NamedImage[] = [];
  for (let index = 0; index < pageCount; index++) {
    renderPage(index);
    onProgress?.(`Rendering slide ${index + 1} of ${pageCount}…`);
    files.push({
      name: `${basename}-${String(index + 1).padStart(2, '0')}.png`,
      blob: await pngBlob(canvas)
    });
  }
  if (files.length === 1) {
    deliver(files[0].blob, `${basename}.png`);
    return 'png';
  }
  onProgress?.('Packaging all slides into a ZIP…');
  const zipped = await makeUncompressedZip(files);
  deliver(zipped, `${basename}-complete-${files.length}-slides.zip`);
  return 'zip';
}
