import { quotes } from '../lib/quote-data';
import { fitPosterText } from '../lib/poster-layout';
import { chooseRandomQuoteId } from '../lib/quote-interactions';
import { studioFormats, studioThemes, studioTextArea } from '../lib/studio-config';
import type { StudioFormat, StudioTheme } from '../lib/studio-config';

const search = document.querySelector<HTMLInputElement>('#studio-search');
const picker = document.querySelector<HTMLSelectElement>('#studio-quote');
const formatSelect = document.querySelector<HTMLSelectElement>('#studio-format');
const themeSelect = document.querySelector<HTMLSelectElement>('#studio-theme');
const border = document.querySelector<HTMLInputElement>('#studio-border');
const random = document.querySelector<HTMLButtonElement>('#studio-random');
const download = document.querySelector<HTMLButtonElement>('#studio-download');
const source = document.querySelector<HTMLAnchorElement>('#studio-source');
const canvas = document.querySelector<HTMLCanvasElement>('#studio-canvas');
const status = document.querySelector<HTMLElement>('#studio-status');
const dimensions = document.querySelector<HTMLElement>('#studio-dimensions');
const count = document.querySelector<HTMLElement>('#studio-result-count');

const byId = new Map(quotes.map((quote) => [quote.id, quote]));
const labels = new Map(quotes.map((quote, index) => [
  quote.id, `#${String(index + 1).padStart(3, '0')} · ${quote.person} · ${quote.quote.replace(/\s+/g, ' ').slice(0, 80)}`
]));

function announce(message: string): void {
  if (status) status.textContent = message;
}

function selectedFormat(): StudioFormat {
  const candidate = formatSelect?.value as StudioFormat;
  return candidate in studioFormats ? candidate : 'square';
}
function selectedTheme(): StudioTheme {
  const candidate = themeSelect?.value as StudioTheme;
  return candidate in studioThemes ? candidate : 'midnight';
}
function render(): boolean {
  if (!canvas || !picker || !download) return false;
  const ctx = canvas.getContext('2d');
  const quote = byId.get(picker.value);
  if (!ctx || !quote) {
    download.disabled = true;
    announce(quote ? 'Canvas preview is unavailable in this browser.' : 'No quotation matches your search.');
    return false;
  }
  const format = selectedFormat();
  const { width, height } = studioFormats[format];
  const theme = studioThemes[selectedTheme()];
  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute('aria-label', `Preview of quotation by ${quote.person} in ${width} by ${height} format`);
  if (dimensions) dimensions.textContent = `${width} × ${height} pixels`;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.background);
  gradient.addColorStop(1, theme.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const pad = Math.round(Math.min(width, height) * .055);
  ctx.strokeStyle = theme.accent;
  ctx.globalAlpha = .58;
  if (border?.checked) {
    ctx.lineWidth = 3;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
    ctx.lineWidth = 1;
    ctx.strokeRect(pad + 11, pad + 11, width - (pad + 11) * 2, height - (pad + 11) * 2);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.accent;
  const titleSize = Math.max(17, Math.round(Math.min(width, height) * .026));
  ctx.font = `700 ${titleSize}px Georgia, serif`;
  ctx.fillText('✧  J E S T E R   Q U O T E S  ✧', width / 2, Math.round(height * .11));

  const area = studioTextArea(format);
  const measure = (text: string, fontSize: number): number => {
    ctx.font = `${fontSize}px Georgia, serif`;
    return ctx.measureText(text).width;
  };
  const layout = fitPosterText(quote.quote, area.width, area.height, measure);
  if (!layout) {
    download.disabled = true;
    ctx.fillStyle = theme.foreground;
    ctx.font = `26px Georgia, serif`;
    ctx.fillText('This quotation needs more room.', width / 2, height / 2 - 10);
    ctx.font = `18px sans-serif`;
    ctx.fillText('Choose Portrait or Story, or select a shorter quote.', width / 2, height / 2 + 32);
    announce('This quotation cannot fit in the selected format. Try Portrait or Story.');
    if (source) source.href = `/quotes/${encodeURIComponent(quote.id)}/`;
    return false;
  }

  ctx.fillStyle = theme.foreground;
  ctx.font = `${layout.fontSize}px Georgia, serif`;
  ctx.textBaseline = 'alphabetic';
  let y = area.top + (area.height - layout.height) / 2 + layout.fontSize;
  for (const line of layout.lines) {
    ctx.fillText(line, width / 2, y);
    y += layout.lineHeight;
  }
  ctx.fillStyle = theme.accent;
  let authorSize = Math.min(32, Math.round(width * .032));
  const attribution = `— ${quote.person}`;
  while (authorSize >= 14) {
    ctx.font = `700 ${authorSize}px sans-serif`;
    if (ctx.measureText(attribution).width <= area.width) break;
    authorSize -= 2;
  }
  if (authorSize < 14) {
    download.disabled = true;
    announce('Author attribution is too wide for this format.');
    return false;
  }
  ctx.fillText(attribution, width / 2, Math.round(height * .865));
  ctx.font = `700 ${Math.max(13, Math.round(Math.min(width,height)*.016))}px sans-serif`;
  ctx.globalAlpha = .8;
  ctx.fillText('LONG LIVE THE FOOL', width / 2, Math.round(height * .939));
  ctx.globalAlpha = 1;

  download.disabled = false;
  if (source) source.href = `/quotes/${encodeURIComponent(quote.id)}/`;
  announce(`Ready: ${width} × ${height} PNG · ${quote.person}`);
  return true;
}

function filteredOptions(preferredId?: string): void {
  if (!picker) return;
  const query = search?.value.toLocaleLowerCase().trim() ?? '';
  const selected = preferredId ?? picker.value;
  const filtered = quotes.filter((quote) =>
    !query || `${quote.quote} ${quote.person} ${quote.reference ?? ''}`.toLocaleLowerCase().includes(query)
  );
  const options = filtered.map((quote) => new Option(labels.get(quote.id) ?? quote.person, quote.id));
  picker.replaceChildren(...options);
  if (filtered.some((quote) => quote.id === selected)) picker.value = selected;
  if (count) count.textContent = `${filtered.length} quotation${filtered.length === 1 ? '' : 's'} available`;
  render();
}

if (picker && canvas && download) {
  const initial = new URL(window.location.href).searchParams.get('quote');
  if (initial && byId.has(initial)) picker.value = initial;
  else picker.value = 'jester-quote-003';
  render();
  search?.addEventListener('input', () => filteredOptions());
  picker.addEventListener('change', render);
  formatSelect?.addEventListener('change', render);
  themeSelect?.addEventListener('change', render);
  border?.addEventListener('change', render);
  random?.addEventListener('click', () => {
    if (search) search.value = '';
    filteredOptions();
    const chosen = chooseRandomQuoteId(quotes.map((quote) => quote.id));
    if (chosen) picker.value = chosen;
    render();
  });
  download.addEventListener('click', () => {
    if (download.disabled || !render()) return;
    const quote = byId.get(picker.value);
    if (!quote) return;
    download.disabled = true;
    announce('Preparing the full-resolution PNG…');
    try {
      canvas.toBlob((blob) => {
        download.disabled = false;
        if (!blob) {
          announce('Could not export artwork. Try another browser or format.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${quote.id}-${selectedFormat()}-${selectedTheme()}.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 5000);
        announce('Your PNG artwork has been downloaded.');
      }, 'image/png');
    } catch {
      download.disabled = false;
      announce('Canvas export is blocked in this browser.');
    }
  });
}
