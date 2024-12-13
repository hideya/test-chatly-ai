import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "../../hooks/use-chat";
import { Trash2 } from "lucide-react";
import type { Thread } from "@db/schema";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

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
  const [threadToDelete, setThreadToDelete] = useState<Thread | null>(null);
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null);

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
              className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer group 
                ${selectedThreadId === thread.id ? "bg-muted" : ""}
                transition-all duration-200
                data-[state=deleting]:animate-out data-[state=deleting]:fade-out-0 data-[state=deleting]:slide-out-to-left
              `}
              data-state={deletingThreadId === thread.id ? "deleting" : "active"}
              onClick={() => onSelectThread(thread.id)}
              onTouchEnd={(e) => {
                if ((e.target as HTMLElement).closest('[data-scrolling="true"]')) {
                  return;
                }
                e.preventDefault();
                onSelectThread(thread.id);
              }}
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
                className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity rounded-full duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setThreadToDelete(thread);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    <AlertDialog open={!!threadToDelete} onOpenChange={() => setThreadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat thread
              and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (threadToDelete) {
                  setDeletingThreadId(threadToDelete.id);
                  // Add delay to allow animation to complete
                  setTimeout(() => {
                    deleteThread(threadToDelete.id);
                    if (threadToDelete.id === selectedThreadId) {
                      onSelectThread(0);
                    }
                    setThreadToDelete(null);
                  }, 200); // Match duration-200 from the animation
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
