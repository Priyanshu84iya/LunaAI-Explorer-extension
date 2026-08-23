import { getSelectionInfo, type SelectionInfo } from './selectionDetector';
import { createFloatingToolbar, FloatingToolbar } from './floatingToolbar';

console.log('LunaAI content script loaded');

export interface SelectionState {
  text: string;
  visible: boolean;
  x: number;
  y: number;
}

let toolbar: FloatingToolbar | null = null;
let lastSelection: SelectionInfo | null = null;
let updateTimer: number | null = null;

// Centralized selection state, updated whenever a valid selection occurs.
const selectionState: SelectionState = { text: '', visible: false, x: 0, y: 0 };

function ensureToolbar(): FloatingToolbar {
  if (!toolbar) {
    toolbar = createFloatingToolbar();
    toolbar.addEventListener('luna-explore', (e) => {
      const detail = (e as CustomEvent).detail as SelectionInfo;
      if (detail) openExplorer(detail);
    });
  }
  return toolbar;
}

function updateSelection() {
  const info = getSelectionInfo();
  if (info) {
    lastSelection = info;
    const el = ensureToolbar();
    el.show(info);
    selectionState.text = info.text;
    selectionState.visible = true;
    selectionState.x = info.rect.left;
    selectionState.y = info.rect.top;
    console.log('Selected text:', info.text);
  } else {
    lastSelection = null;
    toolbar?.hide();
    selectionState.visible = false;
    selectionState.text = '';
  }
}

function scheduleUpdate() {
  if (updateTimer) window.clearTimeout(updateTimer);
  updateTimer = window.setTimeout(updateSelection, 80);
}

function openExplorer(info: SelectionInfo) {
  toolbar?.hide();
  const payload = {
    text: info.text,
    pageTitle: document.title,
    heading: info.heading,
    nearbyContext: info.nearbyContext,
    domain: window.location.hostname,
    url: window.location.href,
  };

  const messageHandler = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) return;
    const data = event.data;
    if (!data || !data.type) return;
    if (data.type === 'LUNAAI_READY') {
      iframe.contentWindow?.postMessage({ type: 'LUNAAI_INIT', payload }, '*');
    } else if (data.type === 'LUNAAI_CLOSE') {
      closeHandler();
    }
  };

  // Attach the listener before the iframe loads so an early LUNAAI_READY is
  // never missed. postMessage is fire-and-forget, so a late listener would
  // drop the READY message and leave the explorer waiting for INIT forever.
  window.addEventListener('message', messageHandler);

  const host = document.createElement('div');
  host.id = 'lunaai-explorer-host';
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.zIndex = '2147483647';
  const shadow = host.attachShadow({ mode: 'open' });

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('src/explorer/index.html');
  iframe.style.position = 'fixed';
  iframe.style.inset = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.background = 'transparent';
  iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
  shadow.appendChild(iframe);

  document.documentElement.appendChild(host);

  const closeHandler = () => {
    host.remove();
    window.removeEventListener('message', messageHandler);
  };
}

// Robust multi-event selection detection: mouse, keyboard, and touch.
document.addEventListener('selectionchange', scheduleUpdate);
document.addEventListener('mouseup', scheduleUpdate);
document.addEventListener('keyup', scheduleUpdate);
document.addEventListener('touchend', scheduleUpdate);

window.addEventListener('scroll', () => {
  toolbar?.reposition();
}, { passive: true });
window.addEventListener('resize', () => {
  toolbar?.reposition();
});
