import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "../../hooks/use-chat";
import { Trash2 } from "lucide-react";
import type { Thread } from "@db/schema";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
  threads: Thread[];
  selectedThreadId: number | null;
  onSelectThread: (id: number) => void;
}

export default function ChatList({
  threads,
  selectedThreadId,
  onSelectThread,
}: ChatListProps) {
  const { deleteThread } = useChat();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <Button
          onClick={() => onSelectThread(0)}
          className="w-full"
          variant={selectedThreadId === 0 ? "secondary" : "outline"}
        >
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer group ${
                selectedThreadId === thread.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelectThread(thread.id)}
            >
              <div className="truncate flex-1">
                <h3 className="text-sm font-medium truncate">{thread.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(thread.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.id);
                  if (thread.id === selectedThreadId) {
                    onSelectThread(0);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
