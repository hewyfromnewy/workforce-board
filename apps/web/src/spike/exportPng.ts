/**
 * Image-export spike (#4). Render a DOM element to a fixed-size PNG.
 *
 * Uses html2canvas-pro (not plain html2canvas) because the project's Tailwind v4
 * styling emits modern CSS color functions (oklch/lab) that plain html2canvas
 * cannot parse — the -pro fork was created to handle them.
 */
/** Render an element to a PNG blob at a fixed pixel scale (default 2x for crispness). */
export async function renderElementToPng(
  el: HTMLElement,
  scale = 2,
): Promise<Blob> {
  // Lazy-load the ~350 KB renderer only when an export actually happens.
  const { default: html2canvas } = await import('html2canvas-pro');
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))),
      'image/png',
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Copy a PNG blob to the clipboard. Returns false if the browser/context blocks it. */
export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}
