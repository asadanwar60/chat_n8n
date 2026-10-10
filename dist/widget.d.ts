import { ChatConfig } from './types';
import './styles.css';
export declare class ChatWidget {
    private config;
    private metadataSource;
    private authTokenStorageKey;
    private deviceIdStorageKey;
    private onMessageReceived;
    private container;
    private bubbleBtn;
    private windowEl;
    private messagesContainer;
    private inputEl;
    private sendBtn;
    private isOpen;
    private isThinking;
    private messages;
    private storageKey;
    constructor(options: ChatConfig);
    setMetadata(metadata: Record<string, any> | (() => Record<string, any>)): void;
    private decodeJwtRole;
    private resolveMetadata;
    private generateUUID;
    private initDOM;
    private toggleChat;
    private loadHistory;
    private saveHistory;
    private renderAllMessages;
    private appendMessageElement;
    private showTypingIndicator;
    private hideTypingIndicator;
    private handleSend;
    private scrollToBottom;
    private escapeHTML;
    destroy(): void;
}
/**
 * Public export function matching the standard @n8n/chat factory API
 */
export declare function createChat(config: ChatConfig): ChatWidget;
