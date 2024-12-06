import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "../../hooks/use-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput, { ChatInputHandle } from "./ChatInput";
import { Loader2 } from "lucide-react";
import type { Message } from "@db/schema";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import type { ParseError } from 'katex';

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

  const renderInlineMath = (content: string, messageId: number, contentIndex: number): React.ReactNode[] => {
    try {
      const inlineElements: React.ReactNode[] = [];
      let lastIndex = 0;
      const inlineRegex = /\\\((.*?)\\\)/g;
      let match: RegExpExecArray | null;
      let inlineCount = 0;

      while ((match = inlineRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          inlineElements.push(
            <span key={`text-${messageId}-${contentIndex}-${inlineCount}`}>
              {content.slice(lastIndex, match.index)}
            </span>
          );
        }
        
        const mathContent = (match[1] || '').trim();
        inlineElements.push(
          <InlineMath 
            key={`inline-math-${messageId}-${contentIndex}-${inlineCount}`}
            math={mathContent}
          />
        );
        lastIndex = match.index + match[0].length;
        inlineCount++;
      }
      
      if (lastIndex < content.length) {
        inlineElements.push(
          <span key={`text-${messageId}-${contentIndex}-${inlineCount}`}>
            {content.slice(lastIndex)}
          </span>
        );
      }
      
      return inlineElements;
    } catch (error) {
      console.error('Error rendering inline math:', error);
      return [<span key="error" className="text-destructive">Error rendering mathematical expression</span>];
    }
  };

  const pushInlineMathElement = (elements: React.ReactNode[], textContent: string, messageId: number, elementIndex: number): void => {
    const inlineElements = renderInlineMath(textContent, messageId, elementIndex);
    elements.push(
      <div 
        key={`text-content-${messageId}-${elementIndex}-${textContent.substring(0, 10)}`} 
        className="whitespace-pre-wrap"
      >
        {inlineElements}
      </div>
    );
  };

  const pushBlockMathElement = (elements: React.ReactNode[], mathContent: string, messageId: number, elementIndex: number): void => {
    elements.push(
      <div 
        key={`block-math-${messageId}-${elementIndex}-${mathContent.substring(0, 10)}`} 
        className="mt-6 mb-6"
      >
        <BlockMath math={mathContent} />
      </div>
    );
  };

  const renderMessageContent = (content: string, messageId: number) => {
    if (!content) return null;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let elementIndex = 0;
    
    // Match block math expressions between lines containing only \[ and \], allowing flexible whitespace
    const blockRegex = /^\s*\\\[\s*\n(.*)\n\s*\\\]\s*$/gm;
    let match: RegExpExecArray | null;
    
    while ((match = blockRegex.exec(content)) !== null) {
      // Handle text before the math block
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index);
        if (textContent.length) {
          pushInlineMathElement(elements, textContent, messageId, elementIndex);
          elementIndex++;
        }
      }
      
      // Add block math component
      const mathContent = (match[1] || '').trim();
      pushBlockMathElement(elements, mathContent, messageId, elementIndex);
      elementIndex++;
      lastIndex = match.index + match[0].length + 1 /* eliminate the tailingnewline */;
    }
    
    // Handle remaining text and inline math
    const remainingContent = content.slice(lastIndex);
    if (remainingContent.length) {
      pushInlineMathElement(elements, remainingContent, messageId, elementIndex);
    }
    
    return elements;
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
