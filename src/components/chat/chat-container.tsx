/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import MessageInput from "./message-input";
import { MessageItem } from "./message-item";
import type { ChatMessage, DetectedLanguage, Language } from "@/types/api";
import { generateMessageId } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import ModelDownloadProgress from "../model-download-progress";
import {
  modelManager,
  type ModelInfo as ModelInfoType,
  type ModelType,
} from "@/lib/model-manager";
import { dbService } from "@/lib/db";
import { ModelInfo } from "../model-info";
import { LANGUAGES } from "@/lib/constants";
import { canSummarizeMessage } from "@/lib/utils";

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelStates, setModelStates] = useState<
    Record<ModelType, ModelInfoType>
  >({
    summarizer: { status: "unavailable" },
    translator: { status: "unavailable" },
    detector: { status: "unavailable" },
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeApp = async () => {
      const subscriptions = ["summarizer", "translator", "detector"].map(
        (type) =>
          modelManager.subscribe(type as ModelType, (info) => {
            setModelStates((prev) => ({ ...prev, [type]: info }));
          })
      );

      await modelManager.initializeModels();
      await loadMessages();

      setIsLoading(false);

      return () => {
        subscriptions.forEach((unsubscribe) => unsubscribe());
      };
    };

    initializeApp();
  }, []);

  const loadMessages = async () => {
    try {
      const savedMessages = await dbService.getAllMessages();
      setMessages(savedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const loadRelatedMessages = async (messageId: string) => {
    try {
      const relatedMessages = await dbService.getRelatedMessages(messageId);
      setMessages((prevMessages) => [...prevMessages, ...relatedMessages]);
    } catch (error) {
      console.error("Failed to load related messages: ", error);
      toast.error("Failed to load related messages");
    }
  };

  const saveMessage = async (message: ChatMessage) => {
    try {
      await dbService.saveMessage(message);
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to save message");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectLanguage = async (
    text: string
  ): Promise<DetectedLanguage | null> => {
    if (modelStates.detector.status !== "ready") {
      toast.error("Language detection is not available");
      return null;
    }

    try {
      const detector = await (window as any).ai.languageDetector.create();
      const results = await detector.detect(text);
      return results[0];
    } catch (error) {
      console.error("Error detecting language:", error);
      toast.error("Failed to detect language");
      return null;
    }
  };

  const handleSend = async (content: string) => {
    const detectedLanguage = await detectLanguage(content);

    try {
      setIsProcessing(true);

      const userMessage: ChatMessage = {
        id: generateMessageId(),
        content,
        role: "user",
        timestamp: Date.now(),
        detectedLanguage: detectedLanguage ?? undefined,
      };

      await saveMessage(userMessage);
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        content: `I received your message in ${
          detectedLanguage?.detectedLanguage ?? "unknown"
        } language. `,
        role: "assistant",
        timestamp: Date.now(),
      };

      await saveMessage(assistantMessage);
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      await loadRelatedMessages(userMessage.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to process message");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async (
    messageId: string,
    targetLanguage: Language
  ) => {
    if (modelStates.translator.status !== "ready") {
      toast.error("Translation is not available");
      return;
    }

    const message = messages.find((msg) => msg.id === messageId);

    if (!message) {
      toast.error("Message not found");
      return;
    }

    try {
      const translator = await (window as any).ai.translator.create({
        sourceLanguage: message.detectedLanguage?.detectedLanguage ?? "en",
        targetLanguage,
      });

      const translatedText = await translator.translate(message.content);

      const translationMessage: ChatMessage = {
        id: generateMessageId(),
        content: `Translation to ${
          LANGUAGES.find((lang) => lang.value === targetLanguage)?.label
        }:\n${translatedText}`,
        role: "assistant",
        timestamp: Date.now(),
        originalMessageId: messageId,
      };

      await saveMessage(translationMessage);
      setMessages((prev) => [...prev, translationMessage]);
      await loadRelatedMessages(messageId);
    } catch (error) {
      console.error("Error translating message:", error);
      toast.error("Failed to translate message");
    }
  };

  const handleSummarize = async (messageId: string) => {
    if (modelStates.summarizer.status !== "ready") {
      toast.error("Summarization is not available");
      return;
    }

    const message = messages.find((m) => m.id === messageId);
    if (!message || message.role !== "user") {
      toast.error("Invalid message for summarization");
      return;
    }

    let summaryMessage: ChatMessage;

    try {
      const summarizer = await (window as any).ai.summarizer.create({
        type: "tl;dr",
        format: "plain-text",
        length: "short",
      });

      summaryMessage = {
        id: generateMessageId(),
        content: "Generating summary...",
        role: "assistant",
        timestamp: Date.now(),
        originalMessageId: messageId,
      };

      setMessages((prev) => [...prev, summaryMessage]);

      const stream = await summarizer.summarizeStreaming(message.content);

      let summary = "";

      for await (const chunk of stream) {
        summary += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === summaryMessage.id
              ? { ...m, content: `Summary:\n${summary}` }
              : m
          )
        );
      }

      const finalSummaryMessage = {
        ...summaryMessage,
        content: `Summary:\n${summary}`,
      };
      await saveMessage(finalSummaryMessage);
    } catch (error) {
      console.error("Summarization failed: ", error);
      toast.error("Summarization failed");
      setMessages((prev) => prev.filter((m) => m.id !== summaryMessage.id));
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Initializing</AlertTitle>
          <AlertDescription>
            Please wait while we set up the application...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isDownloading = Object.values(modelStates).some(
    (state) => state.status === "downloading"
  );

  const areModelsReady = Object.values(modelStates).some(
    (state) => state.status === "ready"
  );

  if (isDownloading) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Downloading required models</AlertTitle>
            <AlertDescription>
              Please wait while we download the necessary AI models...
            </AlertDescription>
          </Alert>
          {Object.entries(modelStates).map(([type, info]) => (
            <ModelDownloadProgress
              key={type}
              type={type as ModelType}
              info={info}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!areModelsReady) {
    return (
      <div className="h-screen flex items-center justify-center p-4 ">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Models Unavailable</AlertTitle>
          <AlertDescription>
            Some AI models are not available in your browser. Please try using a
            newer version of Chrome.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500">
      <div className="p-2 md:p-4 bg-white bg-opacity-80 shadow-md">
        {" "}
        <h1 className="text-lg md:text-2xl font-bold text-blue-800 mb-2 md:mb-4">
          AI-Powered Text Processing
        </h1>{" "}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {" "}
          {(Object.entries(modelStates) as [ModelType, ModelInfoType][]).map(
            ([type, info]) => (
              <ModelInfo key={type} type={type} info={info} />
            )
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        {" "}
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onTranslate={(language) => handleTranslate(message.id, language)}
            onSummarize={() => handleSummarize(message.id)}
            canSummarize={canSummarizeMessage(message)}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-2 md:p-4 bg-white bg-opacity-80">
        {" "}
        <MessageInput onSend={handleSend} disabled={isProcessing} />
      </div>
    </div>
  );
}
