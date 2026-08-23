import type { ProviderSettings } from '../ai/types';
import { resolveSettings } from '../ai/config';

export async function getSettings(): Promise<ProviderSettings> {
  try {
    const stored = await chrome.storage.sync.get(['lunaaiSettings']);
    return resolveSettings(stored.lunaaiSettings as Partial<ProviderSettings> | undefined);
  } catch {
    return resolveSettings();
  }
}

export async function saveSettings(settings: ProviderSettings): Promise<void> {
  await chrome.storage.sync.set({ lunaaiSettings: settings });
}

export async function clearCache(): Promise<void> {
  await chrome.storage.local.remove(['lunaaiImageCache']);
  await chrome.storage.local.remove(['lunaaiResponseCache']);
}

export async function resetSettings(): Promise<void> {
  await chrome.storage.sync.remove('lunaaiSettings');
}

export async function cacheImage(key: string, dataUrl: string): Promise<void> {
  try {
    const stored = await chrome.storage.local.get(['lunaaiImageCache']);
    const cache = (stored.lunaaiImageCache as Record<string, string>) ?? {};
    cache[key] = dataUrl;
    await chrome.storage.local.set({ lunaaiImageCache: cache });
  } catch {
    // ignore storage errors
  }
}

export async function getCachedImage(key: string): Promise<string | null> {
  try {
    const stored = await chrome.storage.local.get(['lunaaiImageCache']);
    const cache = (stored.lunaaiImageCache as Record<string, string>) ?? {};
    return cache[key] ?? null;
  } catch {
    return null;
  }
}
