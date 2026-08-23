import type { SelectionInfo } from './selectionDetector';

const STYLE = `
:host {
  all: initial;
}
*, *::before, *::after {
  box-sizing: border-box;
}
.luna-toolbar {
  position: fixed;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(124, 92, 255, 0.95), rgba(56, 225, 196, 0.9));
  color: #0b0e1a;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45), 0 0 24px rgba(124, 92, 255, 0.4);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.35);
  transform-origin: center;
  animation: lunaPop 0.24s cubic-bezier(0.2, 0.9, 0.3, 1.2);
  user-select: none;
  white-space: nowrap;
}
.luna-toolbar:hover {
  filter: brightness(1.08);
}
.luna-spark {
  font-size: 15px;
}
@keyframes lunaPop {
  0% { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
`;

export class FloatingToolbar {
  private host: HTMLElement;
  private root: ShadowRoot;
  private info: SelectionInfo | null = null;

  constructor() {
    this.host = document.createElement('div');
    this.host.style.position = 'fixed';
    this.host.style.zIndex = '2147483646';
    this.host.style.display = 'none';
    this.host.style.all = 'initial';
    this.root = this.host.attachShadow({ mode: 'closed' });
    this.render();
    document.documentElement.appendChild(this.host);
  }

  show(info: SelectionInfo) {
    this.info = info;
    this.host.style.display = 'block';
    this.position(info.rect);
  }

  hide() {
    this.host.style.display = 'none';
  }

  position(rect: DOMRect) {
    const toolbar = this.root.querySelector('.luna-toolbar') as HTMLElement | null;
    if (!toolbar) return;
    const tw = toolbar.offsetWidth;
    const th = toolbar.offsetHeight;
    let x = rect.left + rect.width / 2 - tw / 2;
    let y = rect.top - th - 12;
    if (y < 8) y = rect.bottom + 12;
    x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
    toolbar.style.left = `${x}px`;
    toolbar.style.top = `${y}px`;
  }

  reposition() {
    if (this.info) this.position(this.info.rect);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this.host.addEventListener(type, listener);
  }

  private render() {
    const style = document.createElement('style');
    style.textContent = STYLE;
    this.root.appendChild(style);

    const toolbar = document.createElement('div');
    toolbar.className = 'luna-toolbar';
    toolbar.innerHTML = '<span class="luna-spark">✨</span><span>Explain with LunaAI</span>';
    // Prevent the browser from clearing the selection before the click is processed.
    toolbar.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    toolbar.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    toolbar.addEventListener('mouseup', (e) => e.stopPropagation());
    toolbar.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.host.dispatchEvent(new CustomEvent('luna-explore', { detail: this.info, bubbles: true, composed: true }));
    });
    this.root.appendChild(toolbar);
  }
}

export function createFloatingToolbar(): FloatingToolbar {
  return new FloatingToolbar();
}
