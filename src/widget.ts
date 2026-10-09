import { ChatConfig, ChatMessage } from './types';
import './styles.css';

const DEFAULT_INITIAL_MESSAGES = [
  "Hi there! 👋",
  "How can I help you today?",
];

export class ChatWidget {
  private config: Required<ChatConfig>;
  private container!: HTMLElement;
  private bubbleBtn!: HTMLButtonElement;
  private windowEl!: HTMLElement;
  private messagesContainer!: HTMLElement;
  private inputEl!: HTMLInputElement;
  private sendBtn!: HTMLButtonElement;
  private isOpen = false;
  private isThinking = false;
  private messages: ChatMessage[] = [];
  private storageKey: string;

  constructor(options: ChatConfig) {
    if (!options.apiUrl) {
      throw new Error('[n8n-saas-widget] "apiUrl" is required to initialize chat widget.');
    }

    const botId = options.botId || 'default_bot';
    this.storageKey = `n8n_chat_history_${botId}`;

    const sessionId =
      options.sessionId ||
      localStorage.getItem(`n8n_chat_session_${botId}`) ||
      this.generateUUID();

    localStorage.setItem(`n8n_chat_session_${botId}`, sessionId);

    this.config = {
      apiUrl: options.apiUrl.replace(/\/+$/, ''),
      botId: botId,
      sessionId: sessionId,
      title: options.title || 'Customer Support',
      subtitle: options.subtitle || "We're here to help 24/7",
      primaryColor: options.primaryColor || '#2563eb',
      initialMessages: options.initialMessages || DEFAULT_INITIAL_MESSAGES,
      placeholder: options.placeholder || 'Type your question...',
      position: options.position || 'bottom-right',
      footerText: options.footerText || 'Powered by AI Support',
    };

    this.initDOM();
    this.loadHistory();
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private initDOM(): void {
    if (typeof document === 'undefined') return;

    // Remove any existing widget root to prevent duplicate bubbles
    const existing = document.querySelector('.n8n-chat-root');
    if (existing) {
      existing.remove();
    }

    document.documentElement.style.setProperty('--n8n-primary-color', this.config.primaryColor);

    this.container = document.createElement('div');
    this.container.className = `n8n-chat-root position-${this.config.position}`;

    this.container.innerHTML = `
      <div class="n8n-chat-window n8n-hidden">
        <div class="n8n-chat-header">
          <div class="n8n-chat-header-info">
            <div class="n8n-chat-header-title">
              <span class="n8n-chat-status-dot"></span>
              <span>${this.escapeHTML(this.config.title)}</span>
            </div>
            <div class="n8n-chat-header-subtitle">${this.escapeHTML(this.config.subtitle)}</div>
          </div>
          <button class="n8n-chat-close-btn" aria-label="Close chat">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="n8n-chat-messages"></div>
        <div class="n8n-chat-footer-wrapper">
          <form class="n8n-chat-input-form">
            <input type="text" class="n8n-chat-input" placeholder="${this.escapeHTML(this.config.placeholder)}" />
            <button type="submit" class="n8n-chat-send-btn" aria-label="Send message">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
          ${this.config.footerText ? `<div class="n8n-chat-branding">${this.escapeHTML(this.config.footerText)}</div>` : ''}
        </div>
      </div>
      <button class="n8n-chat-bubble" aria-label="Open chat">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    `;

    document.body.appendChild(this.container);

    this.bubbleBtn = this.container.querySelector('.n8n-chat-bubble')!;
    this.windowEl = this.container.querySelector('.n8n-chat-window')!;
    this.messagesContainer = this.container.querySelector('.n8n-chat-messages')!;
    this.inputEl = this.container.querySelector('.n8n-chat-input')!;
    this.sendBtn = this.container.querySelector('.n8n-chat-send-btn')!;
    const closeBtn = this.container.querySelector('.n8n-chat-close-btn')!;
    const form = this.container.querySelector('.n8n-chat-input-form')!;

    this.bubbleBtn.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.toggleChat(false));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSend();
    });
  }

  private toggleChat(forceState?: boolean): void {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.isOpen) {
      this.windowEl.classList.remove('n8n-hidden');
      this.scrollToBottom();
      setTimeout(() => this.inputEl.focus(), 150);
    } else {
      this.windowEl.classList.add('n8n-hidden');
    }
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.messages = JSON.parse(stored);
      }
    } catch {
      this.messages = [];
    }

    if (this.messages.length === 0) {
      for (const greeting of this.config.initialMessages) {
        this.messages.push({
          id: this.generateUUID(),
          sender: 'bot',
          text: greeting,
          timestamp: Date.now(),
        });
      }
      this.saveHistory();
    }

    this.renderAllMessages();
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch {
      // Storage quota or disabled in private mode
    }
  }

  private renderAllMessages(): void {
    this.messagesContainer.innerHTML = '';
    for (const msg of this.messages) {
      this.appendMessageElement(msg);
    }
    this.scrollToBottom();
  }

  private appendMessageElement(msg: ChatMessage): void {
    const el = document.createElement('div');
    el.className = `n8n-chat-msg ${msg.sender}`;
    el.innerText = msg.text;
    this.messagesContainer.appendChild(el);
  }

  private showTypingIndicator(): void {
    if (this.isThinking) return;
    this.isThinking = true;

    const typingEl = document.createElement('div');
    typingEl.className = 'n8n-chat-typing';
    typingEl.id = 'n8n-typing-indicator';
    typingEl.innerHTML = `
      <span class="n8n-typing-dot"></span>
      <span class="n8n-typing-dot"></span>
      <span class="n8n-typing-dot"></span>
    `;
    this.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  }

  private hideTypingIndicator(): void {
    this.isThinking = false;
    const typingEl = document.getElementById('n8n-typing-indicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  private async handleSend(): Promise<void> {
    const text = this.inputEl.value.trim();
    if (!text || this.isThinking) return;

    this.inputEl.value = '';
    this.inputEl.disabled = true;
    this.sendBtn.disabled = true;

    // Add User Message
    const userMsg: ChatMessage = {
      id: this.generateUUID(),
      sender: 'user',
      text: text,
      timestamp: Date.now(),
    };
    this.messages.push(userMsg);
    this.appendMessageElement(userMsg);
    this.saveHistory();
    this.scrollToBottom();

    this.showTypingIndicator();

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          chatInput: text,
          message: text,
          sessionId: this.config.sessionId,
          bot_id: this.config.botId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botResponseText =
        data.output || data.message || 'Thank you for your message.';

      const botMsg: ChatMessage = {
        id: this.generateUUID(),
        sender: 'bot',
        text: botResponseText,
        timestamp: Date.now(),
      };

      this.messages.push(botMsg);
      this.appendMessageElement(botMsg);
      this.saveHistory();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: this.generateUUID(),
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to support right now. Please try again in a moment.',
        timestamp: Date.now(),
      };
      this.messages.push(errorMsg);
      this.appendMessageElement(errorMsg);
    } finally {
      this.hideTypingIndicator();
      this.inputEl.disabled = false;
      this.sendBtn.disabled = false;
      this.inputEl.focus();
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

/**
 * Public export function matching the standard @n8n/chat factory API
 */
export function createChat(config: ChatConfig): ChatWidget {
  return new ChatWidget(config);
}
