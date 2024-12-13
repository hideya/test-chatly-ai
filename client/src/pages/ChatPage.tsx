import { useState } from "react";
import { useChat } from "../hooks/use-chat";
import { useUser } from "../hooks/use-user";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ChatList from "../components/chat/ChatList";
import ChatThread from "../components/chat/ChatThread";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function ChatPage() {
  const { user, logout } = useUser();
  const { threads, isLoadingThreads } = useChat();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(0);

  if (isLoadingThreads) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Chatly AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.username}
          </span>
          <Button variant="outline" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45}>
          <ChatList
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelectThread={setSelectedThreadId}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <ChatThread
            threadId={selectedThreadId}
            onThreadCreated={(id) => setSelectedThreadId(id)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
