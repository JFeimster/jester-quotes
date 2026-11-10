const trigger = document.querySelector<HTMLButtonElement>('#download-poster');
const canvas = document.querySelector<HTMLCanvasElement>('#poster-canvas');
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    if (!paragraph.trim()) { lines.push(''); continue; }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
  }
  return lines;
}
trigger?.addEventListener('click', () => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const text = trigger.dataset.text ?? '';
  const person = trigger.dataset.person ?? '';
  const size = 1080;
  ctx.fillStyle = '#14101e';ctx.fillRect(0,0,size,size);
  ctx.strokeStyle = '#d9ae63';ctx.lineWidth = 4;ctx.strokeRect(44,44,992,992);
  ctx.fillStyle='#d9ae63';ctx.font='bold 30px sans-serif';ctx.fillText('JESTER QUOTES',100,128);
  let lines: string[] = [];
  let fontSize = 62;
  for (; fontSize >= 22; fontSize-=2) {
    ctx.font = `${fontSize}px Georgia, serif`;
    lines=wrap(ctx,text,860);
    if (lines.length * fontSize * 1.3 <= 690) break;
  }
  const lineHeight=fontSize*1.3;
  let y=Math.max(220,480-lines.length*lineHeight/2);
  ctx.fillStyle='#f7eddf';
  for (const line of lines) {ctx.fillText(line,100,y);y+=lineHeight;}
  ctx.fillStyle='#f06c7a';ctx.font='bold 32px sans-serif';ctx.fillText(`— ${person}`.slice(0,46),100,948);
  canvas.toBlob((blob)=>{
    if (!blob) return;
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`${trigger.dataset.id ?? 'jester-quote'}-poster.png`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  },'image/png');
});
