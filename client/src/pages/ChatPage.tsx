import { useState } from "react";
import { useChat } from "../hooks/use-chat";
import { useUser } from "../hooks/use-user";
import { useIsMobile } from "../hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ChatList from "../components/chat/ChatList";
import ChatThread from "../components/chat/ChatThread";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function ChatPage() {
  const { user, logout } = useUser();
  const { threads, isLoadingThreads } = useChat();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();

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
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </Button>
        )}
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
        {(!isMobile || showMobileMenu) && (
          <>
            <ResizablePanel 
              defaultSize={30} 
              minSize={25} 
              maxSize={45}
              className={`${
                isMobile 
                  ? 'fixed inset-y-0 left-0 z-50 w-3/4 bg-background shadow-lg transition-transform ease-in-out duration-300' 
                  : ''
              } ${
                isMobile && !showMobileMenu ? '-translate-x-full' : 'translate-x-0'
              }`}
            >
              <div className={`${isMobile ? 'absolute inset-0 bg-black/50 -z-10' : 'hidden'}`} 
                onClick={() => setShowMobileMenu(false)} />
              <ChatList
                threads={threads}
                selectedThreadId={selectedThreadId}
                onSelectThread={(id) => {
                  setSelectedThreadId(id);
                  if (isMobile) setShowMobileMenu(false);
                }}
              />
            </ResizablePanel>
            {!isMobile && <ResizableHandle />}
          </>
        )}
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