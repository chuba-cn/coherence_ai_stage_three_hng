"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/constants";
import type { ChatMessage, Language } from "@/types/api";

interface MessageActionsProps {
  message: ChatMessage;
  onTranslate: (lang: Language) => Promise<void>;
  onSummarize: () => Promise<void>;
  canSummarize: boolean;
}

export default function MessageActions({
  message,
  onSummarize,
  onTranslate,
  canSummarize,
}: MessageActionsProps) {
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");

  const handleTranslate = async () => {
    if (selectedLanguage === message.detectedLanguage?.detectedLanguage) {
      toast.error("Cannot translate to the same language");
      return;
    }

    try {
      setIsTranslating(true);
      await onTranslate(selectedLanguage);
      toast.success(
        `Translated to ${
          LANGUAGES.find((lang) => lang.value === selectedLanguage)?.label
        }`
      );
    } catch (error) {
      console.error("Error translating message:", error);
      toast.error("Failed to translate message");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      await onSummarize();
      toast.success("Summary generated");
    } catch (error) {
      console.error("Error summarizing message:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsSummarizing(false);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <div className="flex items-center gap-2">
        <Select
          value={selectedLanguage}
          onValueChange={(value: Language) => setSelectedLanguage(value)}
          disabled={isTranslating}
        >
          <SelectTrigger className="w-[8.75rem]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTranslate}
          disabled={
            isTranslating ||
            selectedLanguage === message.detectedLanguage?.detectedLanguage
          }
          aria-label={`Translate to ${
            LANGUAGES.find((l) => l.value === selectedLanguage)?.label
          }`}
        >
          {isTranslating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Translate
        </Button>
      </div>

      {canSummarize && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSummarize}
          disabled={isSummarizing}
          aria-label="Summarize message"
        >
          {isSummarizing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Summarize
        </Button>
      )}
    </div>
  );
}
