import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "../../hooks/use-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput, { ChatInputHandle } from "./ChatInput";
import { Loader2 } from "lucide-react";
import type { Message } from "@db/schema";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

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

    // Call immediately
    scrollToBottom();
    
    // And after a short delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    // Keep the focus behavior for AI responses
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (threadId !== null && !isLoadingMessages) {
      // Small delay to ensure DOM is updated
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

  const renderMessageContent = (content: string) => {
    if (!content) return null;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match block math expressions between lines containing only \[ and \], allowing flexible whitespace
    const blockRegex = /^[ \t]*\\\[[ \t]*\n([\s\S]*?)\n[ \t]*\\\][ \t]*$/gm;
    let match: RegExpExecArray | null;
    
    while ((match = blockRegex.exec(content)) !== null) {
      // Handle text before the math block
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index);
        if (textContent.trim()) {
          elements.push(
            <div key={`text-${match.index}`} className="mb-2 last:mb-0 whitespace-pre-wrap">
              {textContent}
            </div>
          );
        }
      }
      
      // Add block math component
      elements.push(
        <div key={`block-${match.index}`} className="mb-2 last:mb-0">
          <BlockMath math={(match[1] || '').trim()} />
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Handle remaining text and inline math
    let remainingContent = lastIndex === 0 ? content : content.slice(lastIndex);
    if (remainingContent.length > 0) {
      const inlineElements: React.ReactNode[] = [];
      lastIndex = 0;
      const inlineRegex = /\\\((.*?)\\\)/g;
      
      while ((match = inlineRegex.exec(remainingContent)) !== null) {
        if (match.index > lastIndex) {
          inlineElements.push(remainingContent.slice(lastIndex, match.index));
        }
        
        const mathContent = (match[1] || '').trim();
        inlineElements.push(
          <InlineMath 
            key={`inline-${match.index}`} 
            math={mathContent}
            renderError={(error) => (
              <span className="text-destructive">
                Error rendering math: {error.message}
              </span>
            )}
          />
        );
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < remainingContent.length) {
        inlineElements.push(remainingContent.slice(lastIndex));
      }
      
      if (inlineElements.length > 0) {
        elements.push(
          <div key="remaining" className="mb-2 last:mb-0 whitespace-pre-wrap">
            {inlineElements}
          </div>
        );
      }
    }
    
    return elements;
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
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
                {renderMessageContent(message.content)}
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
