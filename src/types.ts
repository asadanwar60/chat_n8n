export interface ChatConfig {
  /** The backend API endpoint URL (e.g., https://your-domain.com/v1/chat) */
  apiUrl: string;
  /** Optional Bot identifier for multi-bot deployments */
  botId?: string;
  /** Optional Session identifier; auto-generated and persisted in localStorage if omitted */
  sessionId?: string;
  /** Header title displayed on the chat widget */
  title?: string;
  /** Subtitle displayed underneath the title */
  subtitle?: string;
  /** Primary theme color (hex or CSS color string, defaults to #2563eb) */
  primaryColor?: string;
  /** Initial welcome messages displayed when a new chat starts */
  initialMessages?: string[];
  /** Placeholder text for the message input box */
  placeholder?: string;
  /** Screen position of the floating bubble */
  position?: 'bottom-right' | 'bottom-left';
  /** Footer branding text */
  footerText?: string;
  /** Optional static or dynamic metadata object (e.g. token, role, deviceId) sent with every message */
  metadata?: Record<string, any> | (() => Record<string, any>);
  /** Optional localStorage key to read the user's JWT auth token from (defaults to 'velour_auth_token') */
  authTokenStorageKey?: string;
  /** Optional localStorage key to read the user's device ID from (defaults to 'velour_device_id') */
  deviceIdStorageKey?: string;
  /** Optional callback invoked after each bot response is received */
  onMessageReceived?: (message: ChatMessage, rawResponse: any) => void;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}
