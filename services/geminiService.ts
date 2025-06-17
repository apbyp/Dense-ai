

import { GoogleGenAI, Chat, Content, Part as GeminiPart } from "@google/genai";
import { Message, Sender, Part as AppPart } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY for Gemini is not configured. Please set the API_KEY environment variable.");
}

const CHAT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17'; // This remains constant

interface ChatCreationConfig {
  systemInstruction?: string;
  topK?: number;
  topP?: number;
  temperature?: number;
  seed?: number;
  thinkingConfig?: { // Added to control thinking budget
    thinkingBudget?: number;
  };
}

const transformAppPartsToGeminiParts = (appParts: AppPart[]): GeminiPart[] => {
  return appParts.map(part => {
    if (part.text) {
      return { text: part.text };
    }
    if (part.inlineData) {
      // Exclude fileName as it's not part of Gemini's Part.inlineData spec
      const { fileName, ...inlineDataForApi } = part.inlineData;
      return { inlineData: inlineDataForApi };
    }
    // Should not happen with valid AppPart structure
    throw new Error("Invalid AppPart structure: must have text or inlineData.");
  }).filter(Boolean) as GeminiPart[]; // Filter out any undefined/null from potential errors if not throwing
};


// Helper to transform app messages to Gemini history format
const transformMessagesToGeminiHistory = (messages: Message[]): Content[] => {
  return messages.map(msg => ({
    role: msg.sender === Sender.User ? 'user' : 'model',
    parts: transformAppPartsToGeminiParts(msg.parts),
  }));
};

export const createChatSessionWithHistory = (
  chatInitConfig?: ChatCreationConfig,
  initialAppMessages?: Message[]
): Chat => {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. API_KEY might be missing.");
  }
  
  let geminiHistory: Content[] = [];
  if (initialAppMessages && initialAppMessages.length > 0) {
    geminiHistory = transformMessagesToGeminiHistory(initialAppMessages);
  }

  return ai.chats.create({
    model: CHAT_MODEL_NAME, // Actual model name from Google
    config: chatInitConfig, // This now includes systemInstruction and potentially thinkingConfig
    history: geminiHistory.length > 0 ? geminiHistory : undefined,
  });
};
