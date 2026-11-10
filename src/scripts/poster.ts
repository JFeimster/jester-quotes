import { planArtwork, drawArtwork } from '../lib/artwork/canvas-renderer';
import { downloadArtwork } from '../lib/artwork/export-image';

const trigger = document.querySelector<HTMLButtonElement>('#download-poster');
const canvas = document.querySelector<HTMLCanvasElement>('#poster-canvas');
const status = document.querySelector<HTMLElement>('#poster-status');

trigger?.addEventListener('click', async () => {
  if (!canvas || !trigger || trigger.disabled) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (status) status.textContent = 'Canvas downloads are unavailable in this browser.';
    return;
  }
  trigger.disabled = true;
  try {
    const plan = planArtwork(ctx, {
      text: trigger.dataset.text ?? '', person: trigger.dataset.person ?? '',
      id: trigger.dataset.id ?? 'jester-quote',
      format: 'square', theme: 'midnight', border: true
    });
    if (status) status.textContent = `Preparing ${plan.pages.length} full-quote ${plan.pages.length === 1 ? 'image' : 'slides'}…`;
    const type = await downloadArtwork(canvas, plan.pages.length, plan.spec.id + '-complete',
      page => drawArtwork(ctx, plan, page),
      message => { if (status) status.textContent = message; }
    );
    if (status) status.textContent = type === 'zip'
      ? `Downloaded all ${plan.pages.length} full-quote PNG slides as one ZIP.`
      : 'Downloaded the complete quotation with full author credit.';
  } catch (error) {
    if (status) status.textContent = error instanceof Error
      ? `Artwork could not be exported: ${error.message}` : 'Artwork export failed.';
  } finally {
    trigger.disabled = false;
  }
});
