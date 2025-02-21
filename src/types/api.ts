export type Language = "en" | "es" | "fr" | "pt" | "ru" | "tr";

export interface LanguageOption {
  value: string;
  label: string
}

export interface DetectedLanguage {
  detectedLanguage: string;
  confidence: number;
}

export interface APICapabilities {
  translation: boolean;
  detection: boolean;
  summarization: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
  detectedLanguage?: DetectedLanguage;
  translations?: Record<Language, string>;
  summary?: string;
}