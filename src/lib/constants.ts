import type { LanguageOption } from "@/types/api";

export const LANGUAGES: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
  { value: "ru", label: "Russian" },
  { value: "tr", label: "Turkish" },
  { value: "fr", label: "French" },
];

export const MIN_CHARS_FOR_SUMMARY = 150;
