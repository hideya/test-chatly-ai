import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(({ onSubmit, isLoading = false }, ref) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(message);
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ignore Enter key if IME composition is active
    if (e.nativeEvent.isComposing) {
      return;
    }  

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Textarea
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] max-h-[200px]"
        disabled={isSubmitting || isLoading}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isSubmitting || isLoading}
        className="self-center rounded-full h-10 w-11 transition-transform hover:scale-110"
      >
        {isLoading || isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
