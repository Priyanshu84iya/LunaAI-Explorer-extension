# LunaAI Explorer

Turn any highlighted text on any webpage into an understandable topic, powered by **AshnaAI**.

## What it does

Highlight any text on a webpage → click **✨ Explain with LunaAI** → AshnaAI summarizes the topic, explains it simply, and helps you explore related concepts and go deeper.

## Getting started

```bash
cd lunaai-explorer
npm install
npm run dev        # local dev server (explorer preview)
npm run build      # production build -> dist/
```

Load the extension in Chrome/Edge:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `lunaai-explorer` folder

## Architecture

- `src/content/` — text selection detection + floating "Explain with LunaAI" button
- `src/explorer/` — the topic exploration panel (React)
- `src/ai/` — centralized AshnaAI provider, client, schemas, validation
- `src/background/` — MV3 service worker
- `src/popup/`, `src/options/` — extension UI

## AI configuration

Open the extension **Options** page to configure your AshnaAI API endpoint and key. The provider is centralized so UI components never talk to the API directly.

## Privacy

Only the selected text, a small amount of nearby context, the page title, and the relevant heading are sent. The full webpage is never transmitted. Configure your privacy preferences in Options.
