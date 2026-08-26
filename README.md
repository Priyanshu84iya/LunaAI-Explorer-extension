# LunaAI Explorer

Turn any highlighted text on any webpage into an understandable topic, powered by **AshnaAI**.

## What it does

Highlight any text on a webpage → click **✨ Explain with LunaAI** → AshnaAI summarizes the topic, explains it simply, and helps you explore related concepts and go deeper.

## Getting started

Install dependencies and create a production build:

```bash
npm install
npm run build      # type-check, bundle, and copy the manifest to dist/
```

For local development, use `npm run dev` to start the Vite development server and `npm run preview` to preview the production bundle.

Load the built extension in Chrome or Edge:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the generated `dist/` folder.
4. After rebuilding, click **Reload** on the extension card.

## Features

- Explain highlighted text from any webpage using the floating LunaAI toolbar.
- Explore summaries, related concepts, and deeper context in an interactive panel.
- Select an AI model from a searchable, provider-grouped dropdown in **Options**.
- Keep provider configuration centralized through the AshnaAI client and schemas.

## Architecture

- `src/content/` — text selection detection and floating "Explain with LunaAI" button
- `src/explorer/` — the topic exploration panel (React)
- `src/ai/` — centralized AshnaAI provider, client, model catalog, schemas, and validation
- `src/background/` — MV3 service worker
- `src/popup/`, `src/options/` — extension UI and model configuration

## AI configuration

Open the extension **Options** page to configure the AshnaAI API endpoint, API key, and model. Models are searchable and grouped by provider; the selected model is saved with the rest of the extension settings.

## Privacy

Only the selected text, a small amount of nearby context, the page title, and the relevant heading are sent. The full webpage is never transmitted. Configure your privacy preferences in Options.
