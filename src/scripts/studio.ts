import { quotes } from '../lib/quote-data';
import { chooseRandomQuoteId } from '../lib/quote-interactions';
import { studioFormats, studioThemes } from '../lib/studio-config';
import type { StudioFormat, StudioTheme } from '../lib/studio-config';
import { planArtwork, drawArtwork } from '../lib/artwork/canvas-renderer';
import type { ArtworkPlan } from '../lib/artwork/canvas-renderer';
import { downloadArtwork } from '../lib/artwork/export-image';

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
const pageInfo = document.querySelector<HTMLElement>('#studio-page-info');
const next = document.querySelector<HTMLButtonElement>('#studio-next');
const prev = document.querySelector<HTMLButtonElement>('#studio-prev');

const formatChoices = [...document.querySelectorAll<HTMLButtonElement>('[data-studio-format]')];
const themeChoices = [...document.querySelectorAll<HTMLButtonElement>('[data-studio-theme]')];
function syncChoiceButtons(): void {
  for (const button of formatChoices) {
    button.setAttribute('aria-pressed', String(button.dataset.studioFormat === formatSelect?.value));
  }
  for (const button of themeChoices) {
    button.setAttribute('aria-pressed', String(button.dataset.studioTheme === themeSelect?.value));
  }
}
for (const button of formatChoices) {
  button.addEventListener('click', () => {
    if (!formatSelect) return;
    formatSelect.value = button.dataset.studioFormat ?? 'square';
    formatSelect.dispatchEvent(new Event('change', { bubbles: true }));
    syncChoiceButtons();
  });
}
for (const button of themeChoices) {
  button.addEventListener('click', () => {
    if (!themeSelect) return;
    themeSelect.value = button.dataset.studioTheme ?? 'midnight';
    themeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    syncChoiceButtons();
  });
}
formatSelect?.addEventListener('change', syncChoiceButtons);
themeSelect?.addEventListener('change', syncChoiceButtons);
syncChoiceButtons();


const byId = new Map(quotes.map(quote => [quote.id, quote]));
const labels = new Map(quotes.map((quote, index) => [
  quote.id, `#${String(index + 1).padStart(3, '0')} · ${quote.person} · ${quote.quote.replace(/\s+/g, ' ').slice(0, 80)}`
]));
let plan: ArtworkPlan | null = null;
let currentPage = 0;
let exporting = false;

function announce(message: string): void {
  if (status) status.textContent = message;
}
function selectedFormat(): StudioFormat {
  const candidate = formatSelect?.value as StudioFormat;
  return candidate && candidate in studioFormats ? candidate : 'square';
}
function selectedTheme(): StudioTheme {
  const candidate = themeSelect?.value as StudioTheme;
  return candidate && candidate in studioThemes ? candidate : 'midnight';
}
function showPage(): void {
  if (!canvas || !plan) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawArtwork(ctx, plan, currentPage);
  if (pageInfo) pageInfo.textContent = `Slide ${currentPage + 1} of ${plan.pages.length}`;
  if (prev) prev.disabled = currentPage === 0 || exporting;
  if (next) next.disabled = currentPage === plan.pages.length - 1 || exporting;
}
function render(): void {
  if (!canvas || !picker || !download || exporting) return;
  const quote = byId.get(picker.value);
  if (!quote) {
    plan = null;
    download.disabled = true;
    if (pageInfo) pageInfo.textContent = 'No slide available';
    if (prev) prev.disabled = true;
    if (next) next.disabled = true;
    announce('No quote matches your search.');
    return;
  }
  const format = selectedFormat();
  const size = studioFormats[format];
  canvas.width = size.width;
  canvas.height = size.height;
  if (dimensions) dimensions.textContent = `${size.width} × ${size.height} pixels`;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    announce('Canvas artwork is unavailable in this browser.');
    download.disabled = true;
    return;
  }
  try {
    plan = planArtwork(ctx, {
      text: quote.quote, person: quote.person, id: quote.id,
      format, theme: selectedTheme(), border: Boolean(border?.checked)
    });
    currentPage = 0;
    showPage();
    canvas.setAttribute('aria-label', `Complete quote by ${quote.person}: slide ${currentPage + 1} of ${plan.pages.length}`);
    download.disabled = false;
    download.textContent = plan.pages.length === 1 ? 'Download complete PNG ↓' : `Download ${plan.pages.length}-slide ZIP ↓`;
    if (source) source.href = `/quotes/${encodeURIComponent(quote.id)}/`;
    announce(`Full quotation ready: ${plan.pages.length} ${plan.pages.length === 1 ? 'slide' : 'slides'}. ${size.width} × ${size.height} pixels.`);
  } catch (error) {
    plan = null;
    download.disabled = true;
    announce(error instanceof Error ? error.message : 'Could not arrange quote artwork.');
  }
}
function filteredOptions(): void {
  if (!picker) return;
  const query = search?.value.toLocaleLowerCase().trim() ?? '';
  const selected = picker.value;
  const filtered = quotes.filter(quote =>
    !query || `${quote.quote} ${quote.person} ${quote.reference ?? ''}`.toLocaleLowerCase().includes(query)
  );
  picker.replaceChildren(...filtered.map(quote => new Option(labels.get(quote.id) ?? quote.person, quote.id)));
  if (filtered.some(quote => quote.id === selected)) picker.value = selected;
  if (count) count.textContent = `${filtered.length} quotation${filtered.length === 1 ? '' : 's'} available`;
  render();
}

if (picker && canvas && download) {
  const initial = new URL(window.location.href).searchParams.get('quote');
  picker.value = initial && byId.has(initial) ? initial : 'jester-quote-003';
  const requestedTheme = new URL(window.location.href).searchParams.get('theme');
  if (themeSelect && requestedTheme && Object.prototype.hasOwnProperty.call(studioThemes,requestedTheme)) {
    themeSelect.value = requestedTheme;
    syncChoiceButtons();
  }
  render();
  search?.addEventListener('input', filteredOptions);
  picker.addEventListener('change', render);
  formatSelect?.addEventListener('change', render);
  themeSelect?.addEventListener('change', render);
  border?.addEventListener('change', render);
  prev?.addEventListener('click', () => {
    if (plan && currentPage > 0) { currentPage--; showPage(); }
  });
  next?.addEventListener('click', () => {
    if (plan && currentPage < plan.pages.length - 1) { currentPage++; showPage(); }
  });
  random?.addEventListener('click', () => {
    if (search) search.value = '';
    filteredOptions();
    const chosen = chooseRandomQuoteId(quotes.map(q => q.id));
    if (chosen) picker.value = chosen;
    render();
  });
  download.addEventListener('click', async () => {
    if (!plan || exporting || !canvas) return;
    const snapshot = plan;
    const savedPage = currentPage;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    exporting = true;
    download.disabled = true;
    if (prev) prev.disabled = true;
    if (next) next.disabled = true;
    try {
      const type = await downloadArtwork(
        canvas, snapshot.pages.length, `${snapshot.spec.id}-${snapshot.spec.format}-${snapshot.spec.theme}`,
        page => drawArtwork(ctx, snapshot, page),
        announce
      );
      announce(type === 'zip'
        ? `Downloaded all ${snapshot.pages.length} complete-quote PNG slides in one ZIP.`
        : 'Downloaded the complete quotation as a PNG.');
    } catch {
      announce('Artwork download failed. Check browser download permissions and retry.');
    } finally {
      exporting = false;
      currentPage = savedPage;
      showPage();
      download.disabled = false;
    }
  });
}
