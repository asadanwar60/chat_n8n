import { ChatConfig } from './types';
import { ChatWidget, createChat } from './widget';

export * from './types';
export * from './widget';

declare global {
  interface Window {
    createChat?: typeof createChat;
    N8nChatWidget?: {
      createChat: typeof createChat;
      ChatWidget: typeof ChatWidget;
    };
  }
}

if (typeof window !== 'undefined') {
  window.createChat = createChat;
  window.N8nChatWidget = {
    createChat,
    ChatWidget,
  };

  // Auto-mount if script tag includes data attributes:
  // <script src="widget.bundle.js" data-api-url="https://..." data-bot-id="..."></script>
  const currentScript =
    document.currentScript ||
    document.querySelector('script[data-api-url]');

  if (currentScript) {
    const apiUrl = currentScript.getAttribute('data-api-url');
    if (apiUrl) {
      const config: ChatConfig = {
        apiUrl,
        botId: currentScript.getAttribute('data-bot-id') || undefined,
        title: currentScript.getAttribute('data-title') || undefined,
        subtitle: currentScript.getAttribute('data-subtitle') || undefined,
        primaryColor: currentScript.getAttribute('data-primary-color') || undefined,
        placeholder: currentScript.getAttribute('data-placeholder') || undefined,
        position: (currentScript.getAttribute('data-position') as any) || undefined,
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => createChat(config));
      } else {
        createChat(config);
      }
    }
  }
}
