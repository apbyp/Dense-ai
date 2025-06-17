

import * as LocalStorageService from './localStorageService';
import { User, ChatSession, ChatSessionSummary, Message, Part as AppPart, Sender, SupportedModel } from './types';

// Simulate a very simple in-memory "database" on the client for mock backend
// In a real app, this would be a server-side database.
interface MockUserRecord extends User {
  hashedPassword: string;
}
let mockUserDatabase: MockUserRecord[] = [];
let mockChatDatabase: Record<string, ChatSession> = {}; // keyed by chatId
let mockUserChatIndex: Record<string, string[]> = {}; // keyed by userId, value is array of chatIds


const BASE_URL = '/api'; // Mock base URL

interface ApiErrorResponse {
  message: string;
  details?: any;
}

// --- Mock Password Hashing ---
const MOCK_HASH_PREFIX = 'hashed_mock_';
const mockHashPassword = (password: string): string => `${MOCK_HASH_PREFIX}${password}`;
const mockVerifyPassword = (password: string, hashedPassword: string): boolean => {
  return mockHashPassword(password) === hashedPassword;
};


export async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body: any | null = null,
  requiresAuth: boolean = true
): Promise<T & {message?: string}> { // Allow message for non-error success responses too
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  console.log(`Mock API Request: ${method} ${endpoint}`, body);

  let token: string | null = null;
  if (requiresAuth) {
    token = LocalStorageService.loadAuthToken();
    if (!token) {
      console.error("Mock API Error: Auth token required but not found for endpoint:", endpoint);
      throw new Error("Authentication token is missing. Please sign in.");
    }
    const userIdFromToken = token.startsWith('mocktoken_') ? token.split('_')[1] : null;
    if (!userIdFromToken || !mockUserDatabase.find(u => u.id === userIdFromToken)) {
         console.error("Mock API Error: Invalid or expired token for endpoint:", endpoint);
         LocalStorageService.removeAuthToken(); 
         throw new Error("Session expired or token is invalid. Please sign in again.");
    }
  }

  // --- Mock Auth Endpoints ---
  if (endpoint === '/api/auth/signup' && method === 'POST') {
    const { name, email, password } = body as { name: string; email: string; password: string };
    const emailLower = email.toLowerCase();
    if (mockUserDatabase.find(u => u.email.toLowerCase() === emailLower)) {
      throw new Error('Email already exists.');
    }
    const newUser: MockUserRecord = {
      id: `user-${Date.now()}`,
      name,
      email: emailLower,
      hashedPassword: mockHashPassword(password),
      createdAt: new Date(),
    };
    mockUserDatabase.push(newUser);
    mockUserChatIndex[newUser.id] = [];
    const { hashedPassword, ...userForClient } = newUser;
    return { user: userForClient, message: "Signup successful. Please sign in." } as unknown as T;
  }

  if (endpoint === '/api/auth/signin' && method === 'POST') {
    const { email, password } = body as { email: string; password: string };
    const emailLower = email.toLowerCase();
    const user = mockUserDatabase.find(u => u.email.toLowerCase() === emailLower);
    if (!user || !mockVerifyPassword(password, user.hashedPassword)) {
      throw new Error('Invalid email or password.');
    }
    const mockToken = `mocktoken_${user.id}_${Date.now() + 3600 * 1000}`; 
    const { hashedPassword, ...userForClient } = user;
    return { user: userForClient, token: mockToken, message: "Sign in successful!" } as unknown as T;
  }

  if (endpoint === '/api/auth/signout' && method === 'POST') {
    return { message: 'Signed out successfully.' } as unknown as T;
  }
  
  if (endpoint === '/api/auth/me' && method === 'GET' && requiresAuth) {
    const userIdFromToken = token!.split('_')[1]; 
    const user = mockUserDatabase.find(u => u.id === userIdFromToken);
    if (!user) throw new Error("User not found for token.");
    const { hashedPassword, ...userForClient } = user;
    return { user: userForClient } as unknown as T;
  }

  // --- Mock Chat Endpoints (User-specific based on token) ---
  const getUserIdFromToken = (authToken: string | null): string | null => {
    if (!authToken || !authToken.startsWith('mocktoken_')) return null;
    return authToken.split('_')[1];
  };
  const currentUserId = getUserIdFromToken(token);

  if (!currentUserId && requiresAuth && endpoint.startsWith('/api/chats')) {
      throw new Error("User ID could not be determined from token for chat operation.");
  }


  if (endpoint === '/api/chats' && method === 'GET' && requiresAuth) {
    const userChatIds = mockUserChatIndex[currentUserId!] || [];
    const summaries: ChatSessionSummary[] = userChatIds
      .map(id => mockChatDatabase[id])
      .filter(Boolean)
      .map(({ id, title, createdAt, lastUpdatedAt, selectedModel /* optionally include in summary if needed */ }) => ({ 
          id, 
          title, 
          createdAt: new Date(createdAt), 
          lastUpdatedAt: new Date(lastUpdatedAt),
          // selectedModel // if you add it to ChatSessionSummary type
      }))
      .sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
    return summaries as unknown as T;
  }

  if (endpoint === '/api/chats' && method === 'POST' && requiresAuth) {
    const { title, systemInstruction, selectedModel } = body as { title?: string, systemInstruction?: string, selectedModel?: SupportedModel };
    const now = new Date();
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      userId: currentUserId!,
      title: title || `Chat - ${now.toLocaleTimeString()}`,
      createdAt: now,
      lastUpdatedAt: now,
      messages: [{id: `ai-init-${Date.now()}`, sender: Sender.AI, parts: [{text: "Hi there! How can I help?"}], timestamp: now}],
      systemInstruction: systemInstruction || undefined,
      selectedModel: selectedModel || SupportedModel.DenseAiReasoner, // Default model
    };
    mockChatDatabase[newChatId] = newChat;
    if (!mockUserChatIndex[currentUserId!]) mockUserChatIndex[currentUserId!] = [];
    mockUserChatIndex[currentUserId!].push(newChatId);
    return newChat as unknown as T;
  }

  const chatByIdMatch = endpoint.match(/^\/api\/chats\/([^/]+)$/);
  if (chatByIdMatch && requiresAuth) {
    const chatId = chatByIdMatch[1];
    const chat = mockChatDatabase[chatId];

    if (!chat || chat.userId !== currentUserId) {
      throw new Error('Chat not found or access denied.');
    }

    if (method === 'GET') {
      return { 
        ...chat, 
        createdAt: new Date(chat.createdAt), 
        lastUpdatedAt: new Date(chat.lastUpdatedAt), 
        messages: chat.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})) 
      } as unknown as T;
    }

    if (method === 'PUT') {
      const updates = body as Partial<Pick<ChatSession, 'title' | 'messages' | 'systemInstruction' | 'lastUpdatedAt' | 'selectedModel'>>;
      const updatedMessages = updates.messages?.map(m => ({...m, timestamp: new Date(m.timestamp)}));

      mockChatDatabase[chatId] = { 
        ...chat, 
        ...updates, 
        messages: updatedMessages || chat.messages, 
        lastUpdatedAt: new Date(updates.lastUpdatedAt || Date.now()),
        selectedModel: updates.selectedModel || chat.selectedModel, // Ensure selectedModel is updated
      };
      return { 
        ...mockChatDatabase[chatId], 
        createdAt: new Date(mockChatDatabase[chatId].createdAt), 
        lastUpdatedAt: new Date(mockChatDatabase[chatId].lastUpdatedAt) 
      } as unknown as T;
    }

    if (method === 'DELETE') {
      delete mockChatDatabase[chatId];
      mockUserChatIndex[currentUserId!] = mockUserChatIndex[currentUserId!].filter(id => id !== chatId);
      return { message: 'Chat deleted successfully.' } as unknown as T;
    }
  }
  
  console.error(`Mock API Error: Unhandled endpoint or method: ${method} ${endpoint}`);
  throw new Error(`Endpoint ${method} ${endpoint} not found or method not allowed.`);
}