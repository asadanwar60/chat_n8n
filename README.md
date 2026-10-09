# chat_n8n

Lightweight, customizable embeddable AI customer support chat widget designed for the `n8n_saas_api` FastAPI gateway and n8n backend.

## Features
- **Zero-Dependency Core**: Lightweight bundle size (~7KB gzipped) that won't slow down client websites.
- **Universal Compatibility**: Works seamlessly with **React, Next.js, Vue 3, Nuxt, Svelte, Angular, Shopify, WordPress, and Static HTML**.
- **Dual Distribution**:
  - **NPM Package**: for modern framework apps (`import { createChat } from 'chat_n8n'`).
  - **Cloudflare Pages / CDN Script**: for Shopify, WordPress, Webflow, or static HTML sites via a 1-line `<script>` tag.
- **100% Compatible with `n8n_saas_api`**: Talks directly to `/v1/chat` with automatic session persistence and backend bot routing.
- **Persistent Chat History**: Saves conversations in `localStorage` so users never lose their chat when reloading pages.
- **Customizable**: Control title, subtitle, colors, position, placeholder, and initial greeting messages.
- **Mobile Responsive**: Adapts seamlessly from a desktop floating window to a full-screen mobile sheet.

---

## Installation

```bash
npm install chat_n8n
```

Or via CDN script:
```html
<link rel="stylesheet" href="https://your-domain.pages.dev/style.css" />
<script src="https://your-domain.pages.dev/widget.bundle.js" defer></script>
```

---

## Framework Integration Examples

### 1. React & Next.js (App Router)

```tsx
"use client";
import { useEffect } from "react";
import { createChat } from "chat_n8n";
import "chat_n8n/style.css";

export default function SupportChat() {
  useEffect(() => {
    createChat({
      apiUrl: "https://n8n-saas-host.onrender.com/v1/chat",
      title: "Customer Support",
      subtitle: "We're here to help 24/7",
      primaryColor: "#201c18",
      initialMessages: [
        "Hi there! 👋",
        "How can I assist you today?",
      ],
      placeholder: "Type your question...",
    });
  }, []);

  return null;
}
```

---

### 2. Vue 3 (Composition API / `<script setup>`)

```vue
<script setup>
import { onMounted } from 'vue';
import { createChat } from 'chat_n8n';
import 'chat_n8n/style.css';

onMounted(() => {
  createChat({
    apiUrl: 'https://n8n-saas-host.onrender.com/v1/chat',
    title: 'Customer Support',
    subtitle: "Online 24/7",
    primaryColor: '#201c18',
    initialMessages: [
      'Hi there! 👋',
      'How can I help you today?'
    ]
  });
});
</script>

<template>
  <!-- Widget mounts as a floating bubble automatically -->
</template>
```

---

### 3. Nuxt 3 (SSR-friendly with `useHead`)

```vue
<!-- app.vue or layouts/default.vue -->
<script setup>
useHead({
  link: [
    { rel: 'stylesheet', href: 'https://your-domain.pages.dev/style.css' }
  ],
  script: [
    {
      src: 'https://your-domain.pages.dev/widget.bundle.js',
      'data-api-url': 'https://n8n-saas-host.onrender.com/v1/chat',
      'data-title': 'Customer Support',
      'data-primary-color': '#201c18',
      defer: true
    }
  ]
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
```

---

### 4. Svelte / SvelteKit

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { createChat } from 'chat_n8n';
  import 'chat_n8n/style.css';

  onMount(() => {
    createChat({
      apiUrl: 'https://n8n-saas-host.onrender.com/v1/chat',
      title: 'Customer Support',
      primaryColor: '#201c18',
    });
  });
</script>

<slot />
```

---

### 5. Angular

In your component (e.g. `support-chat.component.ts`):

```typescript
import { Component, OnInit } from '@angular/core';
import { createChat } from 'chat_n8n';

@Component({
  selector: 'app-support-chat',
  template: '',
  styleUrls: ['node_modules/chat_n8n/dist/style.css'],
})
export class SupportChatComponent implements OnInit {
  ngOnInit() {
    createChat({
      apiUrl: 'https://n8n-saas-host.onrender.com/v1/chat',
      title: 'Customer Support',
      primaryColor: '#201c18',
    });
  }
}
```

---

### 6. Shopify (theme.liquid) & WordPress

Add this snippet directly before the closing `</body>` tag in Shopify's `theme.liquid` or WordPress `footer.php`:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://your-domain.pages.dev/style.css" />

<!-- Auto-mounting Widget Script -->
<script 
  src="https://your-domain.pages.dev/widget.bundle.js" 
  data-api-url="https://n8n-saas-host.onrender.com/v1/chat"
  data-title="Customer Support"
  data-subtitle="We're here to help 24/7"
  data-primary-color="#201c18"
  defer>
</script>
```

---

### 7. Static HTML / Webflow / Squarespace

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Website</title>
    <link rel="stylesheet" href="https://your-domain.pages.dev/style.css" />
  </head>
  <body>
    <h1>Welcome to our store</h1>

    <!-- Chat Widget Loader -->
    <script 
      src="https://your-domain.pages.dev/widget.bundle.js" 
      data-api-url="https://n8n-saas-host.onrender.com/v1/chat"
      data-title="Concierge Support"
      data-primary-color="#201c18"
      defer>
    </script>
  </body>
</html>
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
| `footerText` | `string` | `Powered by chat_n8n` | Footer branding text. |
