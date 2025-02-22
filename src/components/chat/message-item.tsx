import type { ChatMessage, Language } from "@/types/api";
import { cn } from "@/lib/utils";
import MessageActions from "./message-actions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface MessageItemProps {
  message: ChatMessage;
  onTranslate: (language: Language) => Promise<void>;
  onSummarize: () => Promise<void>;
  canSummarize: boolean;
}

export function MessageItem({
  message,
  onTranslate,
  onSummarize,
  canSummarize,
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <Card
        className={cn(
          "max-w-[80%] mb-4",
          isUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            : "bg-gradient-to-r from-gray-100 to-gray-200"
        )}
      >
        <CardContent className="p-3">
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
          </div>
        </CardContent>
        <CardFooter className="px-3 py-2">
          {message.detectedLanguage && (
            <div className="flex items-center gap-2 text-xs text-gray-200">
              <span>
                Detected:{" "}
                {message.detectedLanguage.detectedLanguage.toUpperCase()}
              </span>
              <span>
                ({Math.round(message.detectedLanguage.confidence * 100)}%
                confidence)
              </span>
            </div>
          )}
        </CardFooter>
        {isUser && (
          <CardFooter className="px-3 py-2 pt-0">
            <MessageActions
              message={message}
              onTranslate={onTranslate}
              onSummarize={ onSummarize }
              canSummarize={canSummarize}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

