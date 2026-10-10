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
