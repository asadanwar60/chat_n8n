const DEFAULT_INITIAL_MESSAGES = [
  "Hi there! 👋",
  "How can I help you today?",
];

export class ChatWidget {
  constructor(options) {
    this.isOpen = false;
    this.isThinking = false;
    this.messages = [];

    if (!options || !options.apiUrl) {
      throw new Error('[n8n-saas-widget] "apiUrl" is required to initialize chat widget.');
    }

    const botId = options.botId || "default_bot";
    this.storageKey = `n8n_chat_history_${botId}`;
    this.metadataSource = options.metadata;
    this.authTokenStorageKey = options.authTokenStorageKey || "velour_auth_token";
    this.deviceIdStorageKey = options.deviceIdStorageKey || "velour_device_id";
    this.onMessageReceived = options.onMessageReceived;

    const sessionId =
      options.sessionId ||
      (typeof localStorage !== "undefined" && localStorage.getItem(`n8n_chat_session_${botId}`)) ||
      this.generateUUID();

    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(`n8n_chat_session_${botId}`, sessionId);
      } catch {}
    }

    this.config = {
      apiUrl: options.apiUrl.replace(/\/+$/, ""),
      botId,
      sessionId,
      title: options.title || "Customer Support",
      subtitle: options.subtitle || "We're here to help 24/7",
      primaryColor: options.primaryColor || "#2563eb",
      initialMessages: options.initialMessages || DEFAULT_INITIAL_MESSAGES,
      placeholder: options.placeholder || "Type your question...",
      position: options.position || "bottom-right",
      footerText: options.footerText || "Powered by AI Support",
    };

    this.initDOM();
    this.loadHistory();
  }

  setMetadata(metadata) {
    this.metadataSource = metadata;
  }

  decodeJwtRole(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return undefined;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      if (payload && typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
        return undefined;
      }
      if (payload && typeof payload.role === "string" && payload.role.trim()) {
        return payload.role.trim().toLowerCase();
      }
      return "customer";
    } catch {
      return undefined;
    }
  }

  resolveMetadata() {
    let customMeta = {};
    try {
      if (typeof this.metadataSource === "function") {
        customMeta = { ...(this.metadataSource() || {}) };
      } else if (this.metadataSource && typeof this.metadataSource === "object") {
        customMeta = { ...this.metadataSource };
      }
    } catch {
      customMeta = {};
    }

    let token = customMeta.token;
    let deviceId = customMeta.deviceId;
    let role = customMeta.role;

    if (typeof window !== "undefined") {
      try {
        if (!token) {
          token =
            localStorage.getItem(this.authTokenStorageKey) ||
            localStorage.getItem("velour_auth_token") ||
            undefined;
        }
        if (!deviceId) {
          deviceId =
            localStorage.getItem(this.deviceIdStorageKey) ||
            localStorage.getItem("velour_device_id") ||
            undefined;
        }
        if (!role && token) {
          role = this.decodeJwtRole(token);
        }
      } catch {}
    }

    const normalizedRole = role
      ? ["admin", "superadmin"].includes(String(role).toLowerCase())
        ? "admin"
        : ["customer", "user"].includes(String(role).toLowerCase())
          ? "customer"
          : "public"
      : token
        ? "customer"
        : "public";

    const resolved = {
      ...customMeta,
      bot_id: this.config.botId,
      role: normalizedRole,
    };

    if (token) {
      resolved.token = token;
    } else {
      delete resolved.token;
    }

    if (deviceId) {
      resolved.deviceId = deviceId;
    }

    return resolved;
  }

  generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  initDOM() {
    if (typeof document === "undefined") return;

    const existing = document.querySelector(".n8n-chat-root");
    if (existing) {
      existing.remove();
    }

    document.documentElement.style.setProperty("--n8n-primary-color", this.config.primaryColor);

    this.container = document.createElement("div");
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
          ${this.config.footerText ? `<div class="n8n-chat-branding">${this.escapeHTML(this.config.footerText)}</div>` : ""}
        </div>
      </div>
      <button class="n8n-chat-bubble" aria-label="Open chat">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    `;

    document.body.appendChild(this.container);

    this.bubbleBtn = this.container.querySelector(".n8n-chat-bubble");
    this.windowEl = this.container.querySelector(".n8n-chat-window");
    this.messagesContainer = this.container.querySelector(".n8n-chat-messages");
    this.inputEl = this.container.querySelector(".n8n-chat-input");
    this.sendBtn = this.container.querySelector(".n8n-chat-send-btn");
    const closeBtn = this.container.querySelector(".n8n-chat-close-btn");
    const form = this.container.querySelector(".n8n-chat-input-form");

    this.bubbleBtn.addEventListener("click", () => this.toggleChat());
    closeBtn.addEventListener("click", () => this.toggleChat(false));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSend();
    });
  }

  toggleChat(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.isOpen) {
      this.windowEl.classList.remove("n8n-hidden");
      this.scrollToBottom();
      setTimeout(() => this.inputEl.focus(), 150);
    } else {
      this.windowEl.classList.add("n8n-hidden");
    }
  }

  loadHistory() {
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
          sender: "bot",
          text: greeting,
          timestamp: Date.now(),
        });
      }
      this.saveHistory();
    }

    this.renderAllMessages();
  }

  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch {}
  }

  renderAllMessages() {
    this.messagesContainer.innerHTML = "";
    for (const msg of this.messages) {
      this.appendMessageElement(msg);
    }
    this.scrollToBottom();
  }

  appendMessageElement(msg) {
    const el = document.createElement("div");
    el.className = `n8n-chat-msg ${msg.sender}`;
    el.innerText = msg.text;
    this.messagesContainer.appendChild(el);
  }

  showTypingIndicator() {
    if (this.isThinking) return;
    this.isThinking = true;

    const typingEl = document.createElement("div");
    typingEl.className = "n8n-chat-typing";
    typingEl.id = "n8n-typing-indicator";
    typingEl.innerHTML = `
      <span class="n8n-typing-dot"></span>
      <span class="n8n-typing-dot"></span>
      <span class="n8n-typing-dot"></span>
    `;
    this.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isThinking = false;
    const typingEl = document.getElementById("n8n-typing-indicator");
    if (typingEl) {
      typingEl.remove();
    }
  }

  async handleSend() {
    const text = this.inputEl.value.trim();
    if (!text || this.isThinking) return;

    this.inputEl.value = "";
    this.inputEl.disabled = true;
    this.sendBtn.disabled = true;

    const userMsg = {
      id: this.generateUUID(),
      sender: "user",
      text,
      timestamp: Date.now(),
    };
    this.messages.push(userMsg);
    this.appendMessageElement(userMsg);
    this.saveHistory();
    this.scrollToBottom();

    this.showTypingIndicator();

    try {
      const metadata = this.resolveMetadata();
      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sendMessage",
          chatInput: text,
          message: text,
          sessionId: this.config.sessionId,
          bot_id: this.config.botId,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botResponseText = data.output || data.message || "Thank you for your message.";

      const botMsg = {
        id: this.generateUUID(),
        sender: "bot",
        text: botResponseText,
        timestamp: Date.now(),
      };

      this.messages.push(botMsg);
      this.appendMessageElement(botMsg);
      this.saveHistory();
      try {
        if (this.onMessageReceived) {
          this.onMessageReceived(botMsg, data);
        }
      } catch {}
    } catch {
      const errorMsg = {
        id: this.generateUUID(),
        sender: "bot",
        text: "Sorry, I am having trouble connecting to support right now. Please try again in a moment.",
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

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export function createChat(config) {
  return new ChatWidget(config);
}

if (typeof window !== "undefined") {
  window.createChat = createChat;
  window.N8nChatWidget = {
    createChat,
    ChatWidget,
  };

  const currentScript =
    document.currentScript || document.querySelector("script[data-api-url]");

  if (currentScript) {
    const apiUrl = currentScript.getAttribute("data-api-url");
    if (apiUrl) {
      const config = {
        apiUrl,
        botId: currentScript.getAttribute("data-bot-id") || undefined,
        title: currentScript.getAttribute("data-title") || undefined,
        subtitle: currentScript.getAttribute("data-subtitle") || undefined,
        primaryColor: currentScript.getAttribute("data-primary-color") || undefined,
        placeholder: currentScript.getAttribute("data-placeholder") || undefined,
        position: currentScript.getAttribute("data-position") || undefined,
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => createChat(config));
      } else {
        createChat(config);
      }
    }
  }
}
