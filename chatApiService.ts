import { ChatSession, ChatSessionSummary, Message, Part as AppPart, SupportedModel } from './types';
import * as ApiService from './apiService';

export const fetchChatSessionSummaries = async (): Promise<ChatSessionSummary[]> => {
  const response = await ApiService.request<ChatSessionSummary[]>('/api/chats', 'GET', null, true);
  // Ensure dates are Date objects
  return response.map(s => ({...s, createdAt: new Date(s.createdAt), lastUpdatedAt: new Date(s.lastUpdatedAt) }));
};

export const fetchChatSessionById = async (chatId: string): Promise<ChatSession> => {
  const response = await ApiService.request<ChatSession>(`/api/chats/${chatId}`, 'GET', null, true);
  // Ensure dates are Date objects
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    lastUpdatedAt: new Date(response.lastUpdatedAt),
    messages: response.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})),
    selectedModel: response.selectedModel || SupportedModel.DenseAiReasoner, // Default if somehow missing
  };
};

export const createChatSession = async (
  data: { title?: string; systemInstruction?: string; selectedModel?: SupportedModel }
): Promise<ChatSession> => {
  const response = await ApiService.request<ChatSession>('/api/chats', 'POST', data, true);
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    lastUpdatedAt: new Date(response.lastUpdatedAt),
    messages: response.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})),
    selectedModel: response.selectedModel || SupportedModel.DenseAiReasoner, // Default if somehow missing
  };
};

export const updateChatSession = async (
  chatId: string,
  updates: { 
    messages?: Message[]; 
    title?: string; 
    systemInstruction?: string; 
    lastUpdatedAt?: Date;
    selectedModel?: SupportedModel; 
  }
): Promise<ChatSession> => {
    // Ensure dates are ISO strings for backend
    const serializableMessages = updates.messages?.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString() 
    }));
    const serializableLastUpdatedAt = updates.lastUpdatedAt?.toISOString();

  const response = await ApiService.request<ChatSession>(`/api/chats/${chatId}`, 'PUT', {
      ...updates,
      messages: serializableMessages,
      lastUpdatedAt: serializableLastUpdatedAt
  }, true);
  return {
    ...response,
    createdAt: new Date(response.createdAt),
    lastUpdatedAt: new Date(response.lastUpdatedAt),
    messages: response.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})),
    selectedModel: response.selectedModel || SupportedModel.DenseAiReasoner, // Default if somehow missing
  };
};

export const deleteChatSession = async (chatId: string): Promise<{ message: string }> => {
  return ApiService.request<{ message: string }>(`/api/chats/${chatId}`, 'DELETE', null, true);
};