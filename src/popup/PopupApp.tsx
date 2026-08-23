import { Settings } from 'lucide-react';
import { getSettings } from '../storage/extensionStorage';

export function PopupApp() {
  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const openSettings = () => {
    getSettings().then((s) => {
      const configured = !!s.apiKey;
      if (!configured) {
        openOptions();
        return;
      }
      // Show a small status. For now, point to options.
      openOptions();
    });
  };

  return (
    <div className="w-72 p-4 bg-luna-bg text-luna-text">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">✨</span>
        <div>
          <h1 className="font-display font-semibold text-sm leading-none">LunaAI Explorer</h1>
          <p className="text-[11px] text-luna-muted mt-0.5">Powered by AshnaAI</p>
        </div>
      </div>

      <p className="text-xs text-luna-muted leading-relaxed mb-4">
        Highlight any text on a webpage, then click <span className="text-white font-semibold">✨ Explore with LunaAI</span> to open an interactive knowledge world.
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={openSettings}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-luna-accent text-white text-sm font-semibold hover:brightness-110 transition-all shadow-glow"
        >
          <Settings size={15} />
          Configure AshnaAI
        </button>
        <button
          onClick={openOptions}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors"
        >
          Open Options
        </button>
      </div>
    </div>
  );
}
