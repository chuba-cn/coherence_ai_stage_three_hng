"use client"

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [ content, setContent ] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (content.trim()) {
      onSend(content);
      setContent("");
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => { 
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        ref={ textareaRef }
        value={ content }
        onChange={ (event) => setContent(event.target.value) }
        onKeyDown={ handleKeyDown }
        placeholder="Type your message..."
        className="min-h-12 max-h-52 resize-none"
        disabled={ disabled }
      />
      <Button type="submit" size="icon" disabled={ disabled || !content.trim() }>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  )
}