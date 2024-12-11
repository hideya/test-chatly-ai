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

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesAreaRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      messagesAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    scrollToBottom();
    
    // Handle AI response focus
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      chatInputRef.current?.focus();
    }
  }, [messages]);

  useEffect(() => {
    if (threadId !== null && !isLoadingMessages) {
      chatInputRef.current?.focus();
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

  const renderInlineMathAndBold = (content: string, messageId: number, contentIndex: number): React.ReactNode[] => {
    try {
      const inlineElements: React.ReactNode[] = [];
      let lastIndex = 0;
      // Match inline math \(...\), bold text **...**, and code `...` patterns
      const combinedRegex = /(\\\((.*?)\\\)|\*\*(.*?)\*\*|`(.*?)`)/g;
      let match: RegExpExecArray | null;
      let inlineCount = 0;
      
      while ((match = combinedRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          inlineElements.push(
            <span key={`text-${messageId}-${contentIndex}-${inlineCount}`}>
              {content.slice(lastIndex, match.index)}
            </span>
          );
        }
        
        if (match[0].startsWith('\\(')) {
          // Handle math content
          const mathContent = (match[2] || '').trim();
          inlineElements.push(
            <InlineMath 
              key={`inline-math-${messageId}-${contentIndex}-${inlineCount}`}
              math={mathContent}
            />
          );
        } else if (match[0].startsWith('*')) {
          // Handle bold content
          const boldContent = match[3] || '';
          inlineElements.push(
            <strong 
              key={`bold-${messageId}-${contentIndex}-${inlineCount}`}
              className="font-bold"
            >
              {boldContent}
            </strong>
          );
        } else {
          // Handle code content
          const codeContent = match[4] || '';
          inlineElements.push(
            <code 
              key={`code-${messageId}-${contentIndex}-${inlineCount}`}
              className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
            >
              {codeContent}
            </code>
          );
        }
        
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
    const inlineElements = renderInlineMathAndBold(textContent, messageId, elementIndex);
    elements.push(
      <div 
        key={`text-content-${messageId}-${elementIndex}-${textContent.substring(0, 10)}`} 
        className="whitespace-pre-wrap"
      >
        {inlineElements}
      </div>
    );
  };

  // Updated helper function to include h1
  const pushHeadingElement = (
    elements: React.ReactNode[],
    content: string,
    level: 'h1' | 'h2' | 'h3',
    messageId: number,
    elementIndex: number
  ): void => {
    const HeadingTag = level;
    const className = {
      h1: 'text-2xl font-bold mt-6 mb-4',
      h2: 'text-xl font-semibold mt-5 mb-3',
      h3: 'text-lg font-medium mt-4 mb-2'
    }[level];
    elements.push(
      <HeadingTag
        key={`${level}-${messageId}-${elementIndex}`}
        className={className}
      >
        {renderInlineMathAndBold(content, messageId, elementIndex)}
      </HeadingTag>
    );
  };

  const pushBlockMathElement = (elements: React.ReactNode[], mathContent: string, messageId: number, elementIndex: number): void => {
    elements.push(
      <div 
        key={`block-math-${messageId}-${elementIndex}-${mathContent.substring(0, 10)}`} 
        className="mt-6 mb-6 overflow-x-auto"
      >
        <BlockMath math={mathContent} />
      </div>
    );
  };

  // Add this new helper function
  const pushCodeBlockElement = (
    elements: React.ReactNode[], 
    codeContent: string, 
    messageId: number, 
    elementIndex: number
  ): void => {
    elements.push(
      <pre 
        key={`code-block-${messageId}-${elementIndex}`}
        className="mt-2 mb-2 overflow-x-auto"
      >
        <code className="block rounded-lg bg-muted p-4 text-sm font-mono">
          {codeContent}
        </code>
      </pre>
    );
  };

  const renderMessageContent = (content: string, messageId: number) => {
    if (!content) return null;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let elementIndex = 0;

    // Split content by lines to process headers first
    const lines = content.split('\n');
    let currentText = '';
    let isInCodeBlock = false;
    let isInMathBlock = false;
    let blockContent = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check for code block start/end
      if (line.trim().startsWith('```')) {
        if (!isInCodeBlock) {
          if (currentText) {
            pushInlineMathElement(elements, currentText, messageId, elementIndex++);
            currentText = '';
          }
          isInCodeBlock = true;
          blockContent = '';
          continue;
        } else {
          isInCodeBlock = false;
          pushCodeBlockElement(elements, blockContent, messageId, elementIndex++);
          continue;
        }
      }
      // Check for math block start/end
      if (line.trim() === '\\[') {
        if (!isInMathBlock) {
          if (currentText) {
            pushInlineMathElement(elements, currentText, messageId, elementIndex++);
            currentText = '';
          }
          isInMathBlock = true;
          blockContent = '';
          continue;
        }
      } else if (line.trim() === '\\]' && isInMathBlock) {
        isInMathBlock = false;
        pushBlockMathElement(elements, blockContent.trim(), messageId, elementIndex++);
        continue;
      }
      // Accumulate block content
      if (isInCodeBlock || isInMathBlock) {
        blockContent += (blockContent ? '\n' : '') + line;
        continue;
      }
      // Handle headers and regular text
      if (line.startsWith('### ')) {
        if (currentText) {
          pushInlineMathElement(elements, currentText, messageId, elementIndex++);
          currentText = '';
        }
        pushHeadingElement(elements, line.slice(3).trim(), 'h3', messageId, elementIndex++);
      } else if (line.startsWith('## ')) {
        if (currentText) {
          pushInlineMathElement(elements, currentText, messageId, elementIndex++);
          currentText = '';
        }
        pushHeadingElement(elements, line.slice(2).trim(), 'h2', messageId, elementIndex++);
      } else if (line.startsWith('# ')) {
        if (currentText) {
          pushInlineMathElement(elements, currentText, messageId, elementIndex++);
          currentText = '';
        }
        pushHeadingElement(elements, line.slice(1).trim(), 'h1', messageId, elementIndex++);
      } else {
        currentText += (currentText ? '\n' : '') + line;
      }
    }
    // Process any remaining text
    if (currentText) {
      pushInlineMathElement(elements, currentText, messageId, elementIndex);
    }
    
    return elements;
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-4" ref={messagesAreaRef}>
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
