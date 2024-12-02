import { useEffect, useRef } from "react";
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

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messages", threadId],
    queryFn: () => getMessages(threadId!),
    enabled: threadId !== null && threadId !== 0,
  });

  const handleSubmit = async (content: string) => {
    if (threadId === 0 || threadId === null) {
      const result = await createThread(content);
      onThreadCreated(result.thread.id);
    } else {
      await sendMessage({ threadId, message: content });
    }
  };

  useEffect(() => {
    const scrollArea = document.querySelector("[data-radix-scroll-area-viewport]");
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    chatInputRef.current?.focus();
  }, []);

  if (threadId === null) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a chat or start a new one
      </div>
    );
  }

  if (isLoading && threadId !== 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderMessageContent = (content: string) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match block math (\[...\])
    const blockRegex = /\\[(.*?)\\]/g;
    let match: RegExpExecArray | null;
    
    while ((match = blockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        elements.push(content.slice(lastIndex, match.index));
      }
      elements.push(
        <BlockMath key={match.index} math={match[1].trim()} />
      );
      lastIndex = match.index + match[0].length;
    }
    
    // Match inline math (\(...\))
    const inlineRegex = /\\((.*?)\\)/g;
    content = lastIndex === 0 ? content : content.slice(lastIndex);
    lastIndex = 0;
    
    while ((match = inlineRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        elements.push(content.slice(lastIndex, match.index));
      }
      elements.push(
        <InlineMath key={`inline-${match.index}`} math={match[1].trim()} />
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      elements.push(content.slice(lastIndex));
    }
    
    return <p className="mb-2 last:mb-0 whitespace-pre-wrap">{elements}</p>;
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
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="max-w-3xl mx-auto">
          <ChatInput ref={chatInputRef} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
