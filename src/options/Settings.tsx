import { useEffect, useState } from 'react';
import { Save, Trash2, RotateCcw } from 'lucide-react';
import type { ProviderSettings } from '../ai/types';
import { getSettings, saveSettings, clearCache, resetSettings } from '../storage/extensionStorage';

export function Settings() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = (patch: Partial<ProviderSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const onSave = async () => {
    if (!settings) return;
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onClearCache = async () => {
    await clearCache();
  };

  const onReset = async () => {
    await resetSettings();
    setSettings(await getSettings());
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-luna-bg text-luna-text flex items-center justify-center">
        <p className="text-sm text-luna-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luna-bg text-luna-text">
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">✨</span>
          <div>
            <h1 className="font-display text-xl font-bold">LunaAI Explorer</h1>
            <p className="text-sm text-luna-muted">Settings · Powered by AshnaAI</p>
          </div>
        </div>

        <div className="glass rounded-xl p-6 space-y-5">
          <Field label="AshnaAI API Endpoint">
            <input
              value={settings.apiEndpoint}
              onChange={(e) => update({ apiEndpoint: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-luna-accent"
              placeholder="https://api.ashna.ai/v1/api"
            />
          </Field>

          <Field label="API Key">
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-luna-accent"
              placeholder="sk-..."
            />
            <p className="text-[11px] text-luna-muted mt-1">
              Stored securely in Chrome sync storage. Never exposed to content scripts.
            </p>
          </Field>

          <Field label="Model">
            <input
              value={settings.model}
              onChange={(e) => update({ model: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-luna-accent"
            />
          </Field>

          <Field label="Privacy mode">
            <div className="flex gap-2">
              {(['minimal', 'standard'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => update({ privacyMode: m })}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                    settings.privacyMode === m
                      ? 'bg-luna-accent text-white'
                      : 'bg-white/5 text-luna-muted hover:bg-white/10'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-luna-muted mt-1">
              Minimal sends only the selected text. Standard also sends page title, heading, and nearby context.
            </p>
          </Field>

          <Toggle
            label="Include page context"
            checked={settings.includeContext}
            onChange={(v) => update({ includeContext: v })}
          />
          <Toggle
            label="Cache AI responses"
            checked={settings.cacheEnabled}
            onChange={(v) => update({ cacheEnabled: v })}
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-luna-accent text-white text-sm font-semibold hover:brightness-110 transition-all shadow-glow"
            >
              <Save size={15} />
              {saved ? 'Saved' : 'Save settings'}
            </button>
            <button
              onClick={onClearCache}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors"
            >
              <Trash2 size={15} />
              Clear cache
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={15} />
              Reset settings
            </button>
          </div>
        </div>

        <div className="mt-6 text-xs text-luna-muted">
          <h2 className="font-semibold text-white mb-2">Privacy</h2>
          <p>
            LunaAI Explorer sends only the selected text plus optional page context to AshnaAI.
            The full webpage is never transmitted. Configure privacy preferences above.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-1"
    >
      <span className="text-sm">{label}</span>
      <span
      className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-luna-accent' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[16px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}
