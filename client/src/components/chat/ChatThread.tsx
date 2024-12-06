import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "../../hooks/use-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput, { ChatInputHandle } from "./ChatInput";
import { Loader2 } from "lucide-react";
import type { Message } from "@db/schema";
import ReactMarkdown from 'react-markdown';

interface ChatThreadProps {
  threadId: number | null;
  onThreadCreated: (id: number) => void;
}

export default function ChatThread({ threadId, onThreadCreated }: ChatThreadProps) {
  const { getMessages, createThread, sendMessage } = useChat();
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["messages", threadId],
    queryFn: () => getMessages(threadId!),
    enabled: threadId !== null && threadId !== 0,
  });

  const handleSubmit = async (content: string) => {
    try {
      if (threadId === 0 || threadId === null) {
        setIsCreatingThread(true);
        const result = await createThread(content);
        onThreadCreated(result.thread.id);
      } else {
        setIsAIResponding(true);
        await sendMessage({ threadId, message: content });
      }
    } finally {
      setIsCreatingThread(false);
      setIsAIResponding(false);
    }
  };

  useEffect(() => {
    const scrollToBottom = () => {
      const scrollArea = document.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);

    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }

    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (threadId !== null && !isLoadingMessages) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 0);
    }
  }, [threadId, isLoadingMessages]);

  if (threadId === null) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a chat or start a new one
      </div>
    );
  }

  if (isLoadingMessages && threadId !== 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderMessageContent = (content: string, messageId: number) => {
    if (!content) return null;

    const components = {
      code: ({ className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
    };

    return (
      <div key={`message-content-${messageId}`}>
        <ReactMarkdown
          components={components}
          className="markdown-content prose dark:prose-invert max-w-none"
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={`message-${message.id}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {renderMessageContent(message.content, message.id)}
              </div>
            </div>
          ))}
          {isAIResponding && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t input-area">
        <div className="max-w-3xl mx-auto">
          <ChatInput 
            ref={chatInputRef} 
            onSubmit={handleSubmit} 
            isLoading={isAIResponding || isCreatingThread}
          />
        </div>
      </div>
    </div>
  );
}