export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64 encoded string
    fileName: string; // For UI display
  };
}

export interface Message {
  id: string;
  sender: Sender;
  parts: Part[];
  timestamp: Date;
}

export enum SupportedModel {
  DenseAiReasoner = 'dense-ai-reasoner', // Default, thinking enabled
  DenseAiChat = 'dense-ai-chat',       // Low latency, thinking disabled
}

export interface ChatSessionSummary {
  id:string;
  title: string;
  createdAt: Date;
  lastUpdatedAt: Date;
  // selectedModel?: SupportedModel; // Optionally include if needed for summary display
}

export interface ChatSession extends ChatSessionSummary {
  messages: Message[];
  systemInstruction?: string;
  selectedModel: SupportedModel; // Each chat session can have its own model setting
  userId: string; // To associate chat session with a user (server would ensure this)
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  // token?: string; // Token is typically managed by auth service, not directly on user object
}