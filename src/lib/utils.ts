/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MIN_CHARS_FOR_SUMMARY } from "./constants";
import { ChatMessage } from "@/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function canSummarizeMessage(message: ChatMessage): boolean {
  return (
    message.role === "user" &&
    message.detectedLanguage?.detectedLanguage === "en" &&
    message.content.length >= MIN_CHARS_FOR_SUMMARY
  );
}
