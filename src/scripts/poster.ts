import { fitPosterText } from '../lib/poster-layout';

const trigger = document.querySelector<HTMLButtonElement>('#download-poster');
const canvas = document.querySelector<HTMLCanvasElement>('#poster-canvas');
const status = document.querySelector<HTMLElement>('#poster-status');

function announce(message: string): void {
  if (status) status.textContent = message;
}

trigger?.addEventListener('click', () => {
  if (!canvas || !trigger || trigger.disabled) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    announce('Poster downloads are not supported in this browser.');
    return;
  }

  const quote = trigger.dataset.text ?? '';
  const person = trigger.dataset.person ?? '';
  const measure = (text: string, fontSize: number) => {
    ctx.font = `${fontSize}px Georgia, serif`;
    return ctx.measureText(text).width;
  };
  const contentTop = 184;
  const contentHeight = 676;
  const layout = fitPosterText(quote, 860, contentHeight, measure);
  if (!layout) {
    announce('This quotation cannot fit into a single readable poster.');
    return;
  }

  trigger.disabled = true;
  announce('Preparing your poster…');
  try {
    const size = 1080;
    ctx.fillStyle = '#14101e';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#d9ae63';
    ctx.lineWidth = 4;
    ctx.strokeRect(44, 44, 992, 992);
    ctx.fillStyle = '#d9ae63';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('JESTER QUOTES', 100, 128);

    let y = contentTop + (contentHeight - layout.height) / 2 + layout.fontSize;
    ctx.fillStyle = '#f7eddf';
    ctx.font = `${layout.fontSize}px Georgia, serif`;
    for (const line of layout.lines) {
      ctx.fillText(line, 100, y);
      y += layout.lineHeight;
    }

    // Scale the full attribution rather than silently clipping a long author name.
    ctx.fillStyle = '#f06c7a';
    let authorFont = 32;
    while (authorFont > 14) {
      ctx.font = `bold ${authorFont}px sans-serif`;
      if (ctx.measureText(`— ${person}`).width <= 860) break;
      authorFont -= 2;
    }
    ctx.font = `bold ${authorFont}px sans-serif`;
    if (ctx.measureText(`— ${person}`).width > 860) {
      trigger.disabled = false;
      announce('Attribution is too long for the poster. Download the social image instead.');
      return;
    }
    ctx.fillText(`— ${person}`, 100, 954);

    canvas.toBlob((blob) => {
      trigger.disabled = false;
      if (!blob) {
        announce('Poster creation failed. Try downloading the social image instead.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${trigger.dataset.id ?? 'jester-quote'}-poster.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      announce('Poster downloaded.');
    }, 'image/png');
  } catch {
    trigger.disabled = false;
    announce('Poster generation failed. Try downloading the social image instead.');
  }
});
