import type {StudioTheme} from '../studio-config';

/** Original paper-cut / printshop canvas decoration. Preserves the measured quote text region. */
export function drawPressTreatment(
  ctx: CanvasRenderingContext2D, width: number, height: number, style: StudioTheme
): void {
  if (style !== 'riot' && style !== 'dada' && style !== 'brutalist') return;
  const unit = Math.min(width,height);
  const ink = style === 'brutalist' ? '#101113' : '#171411';
  const accent = style === 'brutalist' ? '#ff6847' : '#e8393b';
  const lime = '#d6fa3e';
  ctx.save();

  // Physical poster construction — offset border and corner registration markers.
  ctx.fillStyle = ink;
  ctx.fillRect(0,0,width,Math.round(height * .046));
  ctx.fillRect(0,height-Math.round(height*.045),width,Math.round(height*.045));
  ctx.fillStyle = style === 'dada' ? '#1738a8' : accent;
  ctx.fillRect(0,0,Math.round(unit*.026),height);
  ctx.fillRect(width-Math.round(unit*.024),0,Math.round(unit*.024),height);

  // Abstract shapes outside the safe quote area; no text glyphs are covered.
  const corner = Math.round(unit*.18);
  ctx.globalAlpha = style === 'brutalist' ? .32 : .22;
  ctx.fillStyle = style === 'riot' ? lime : accent;
  ctx.beginPath();
  ctx.moveTo(0,Math.round(height*.16));
  ctx.lineTo(corner,Math.round(height*.16));
  ctx.lineTo(0,Math.round(height*.16)+corner);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(width,Math.round(height*.75));
  ctx.lineTo(width-corner*.6,Math.round(height*.75));
  ctx.lineTo(width,Math.round(height*.75)-corner*.7);
  ctx.closePath();
  ctx.fill();

  // Printed halftone edge pattern. Confined to gutters, away from the quote.
  ctx.globalAlpha = .13;
  ctx.fillStyle = ink;
  const dot = Math.max(2,Math.round(unit*.0028));
  const gap = Math.max(12,Math.round(unit*.017));
  for (let y=Math.round(height*.21); y<Math.round(height*.73);y+=gap) {
    for (const x of [Math.round(unit*.055),width-Math.round(unit*.055)]) {
      ctx.beginPath();
      ctx.arc(x,y,dot,0,Math.PI*2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Lively corner print tape / seals retain each direction's identity.
  ctx.translate(width-Math.round(unit*.16),Math.round(height*.155));
  ctx.rotate(style==='dada' ? -.18 : .12);
  const tapeW = Math.round(unit*.13), tapeH=Math.round(unit*.038);
  ctx.fillStyle = style==='brutalist' ? ink : (style==='dada'?'#1738a8':lime);
  ctx.fillRect(-tapeW/2,-tapeH/2,tapeW,tapeH);
  ctx.restore();
}
