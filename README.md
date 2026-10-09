# n8n-saas-widget

Lightweight, customizable embeddable AI customer support chat widget designed for the `n8n_saas_api` FastAPI gateway and n8n backend.

## Features
- **Zero-Dependency Core**: Lightweight bundle size (~15KB) that won't slow down client websites.
- **Dual Distribution**:
  - **NPM Package**: for modern React, Next.js, and Vue apps (`import { createChat } from 'n8n-saas-widget'`).
  - **Standalone CDN Bundle**: for Shopify, WordPress, Webflow, or static HTML sites via a 1-line `<script>` tag.
- **100% Compatible with `n8n_saas_api`**: Talks directly to `/v1/chat` with automatic session persistence and backend bot routing.
- **Persistent Chat History**: Saves conversations in `localStorage` so users never lose their chat when reloading pages.
- **Customizable**: Control title, subtitle, colors, position, placeholder, and initial greeting messages.
- **Mobile Responsive**: Adapts seamlessly from a desktop floating window to a full-screen mobile sheet.

---

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Start local demo server
npm run dev

# 3. Build production bundle (ESM, CJS, and Standalone UMD)
npm run build
```

---

## How Clients Embed It

### Option 1: Standalone Script Tag (Shopify, WordPress, Webflow, HTML)
```html
<script 
  src="https://your-cdn.com/widget.bundle.js" 
  data-api-url="https://your-api.com/v1/chat"
  data-title="Customer Support"
  data-primary-color="#2563eb"
  defer>
</script>
```

### Option 2: NPM Package (React, Next.js, Vue)
```bash
npm install n8n-saas-widget
```

```tsx
import { useEffect } from 'react';
import { createChat } from 'n8n-saas-widget';
import 'n8n-saas-widget/style.css';

export default function SupportChat() {
  useEffect(() => {
    createChat({
      apiUrl: 'https://your-api.com/v1/chat',
      title: 'Support Team',
      subtitle: "We're here to help 24/7",
      primaryColor: '#2563eb',
    });
  }, []);

  return null;
}
```

---

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiUrl` | `string` | *(Required)* | The URL of your FastAPI `/v1/chat` endpoint. |
| `botId` | `string` | `default_bot` | Optional identifier for multi-bot deployments. |
| `title` | `string` | `Customer Support` | Header title in the chat window. |
| `subtitle` | `string` | `We're here to help 24/7` | Subtitle text underneath the title. |
| `primaryColor` | `string` | `#2563eb` | Theme hex color for bubble, header, user bubbles. |
| `position` | `string` | `bottom-right` | Screen position (`bottom-right` or `bottom-left`). |
| `placeholder` | `string` | `Type your question...` | Input field placeholder text. |
| `initialMessages`| `string[]` | `['Hi there! 👋', ...]` | Default welcome messages shown to new visitors. |
| `footerText` | `string` | `Powered by AI Support` | Footer branding text. |
