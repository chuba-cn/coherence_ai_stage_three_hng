import type { ChatMessage, Language } from "@/types/api"
import { cn } from "@/lib/utils"
import MessageActions from "./message-actions"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MessageItemProps {
  message: ChatMessage
  onTranslate: (language: Language) => Promise<void>
  onSummarize: () => Promise<void>
}

export default function MessageItem({ message, onTranslate, onSummarize }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={ cn("flex", isUser ? "justify-end" : "justify-start") }>
      <Card className={ cn("max-w-[80%]", isUser ? "bg-primary text-primary-foreground" : "bg-muted") }>
        <CardContent className="p-3">
          <div className="space-y-2">
            <p className="text-sm">{ message.content }</p>
            { message.translations && (
              Object.entries(message.translations).map(([ lang, translation ]) => (
                <div className="mt-2 pt-2 border-t border-border/50" key={ lang }>
                  <Badge variant="secondary" className="mb-1">
                    {lang.toUpperCase()}
                  </Badge>
                  <p className="text-sm">{ translation }</p>
                </div>
              ))
            ) }
            
            { message.summary && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <Badge variant="secondary" className="mb-1">
                  Summary
                </Badge>
                <p className="text-sm">{message.summary}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-3 py-2">
          { message.detectedLanguage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Detected: { message.detectedLanguage.detectedLanguage.toUpperCase() }</span>
              <span>({Math.round(message.detectedLanguage.confidence * 100)}% confidence)</span>
            </div>
          )}
        </CardFooter>
        { !isUser && (
          <CardFooter className="px-3 py-2 pt-0">
            <MessageActions
              message={ message }
              onTranslate={ onTranslate }
              onSummarize={ onSummarize }
            />
          </CardFooter>
        )}
      </Card>
    </div>
  )
}