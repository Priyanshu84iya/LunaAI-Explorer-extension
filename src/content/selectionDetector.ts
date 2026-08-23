export interface SelectionInfo {
  text: string;
  rect: DOMRect;
  heading?: string;
  nearbyContext?: string;
}

export function getRelevantHeading(): string | undefined {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return undefined;
  const node = sel.getRangeAt(0).startContainer;
  let el: HTMLElement | null =
    node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : (node.parentElement ?? null);
  while (el) {
    if (/^H[1-6]$/.test(el.tagName)) return el.textContent?.trim() ?? undefined;
    el = el.parentElement;
  }
  return undefined;
}

export function getNearbyContext(text: string, maxChars = 400): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';
  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const el: HTMLElement | null =
    container.nodeType === Node.ELEMENT_NODE ? (container as HTMLElement) : (container.parentElement ?? null);
  const full = el?.textContent?.trim() ?? '';
  const idx = full.indexOf(text);
  if (idx < 0) return full.slice(0, maxChars);
  const start = Math.max(0, idx - 120);
  const end = Math.min(full.length, idx + text.length + 120);
  return full.slice(start, end).slice(0, maxChars);
}

export function getSelectionInfo(): SelectionInfo | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const text = sel.toString().trim();
  if (!text) return null;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    text,
    rect,
    heading: getRelevantHeading(),
    nearbyContext: getNearbyContext(text),
  };
}
