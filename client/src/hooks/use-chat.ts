import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Thread, Message } from "@db/schema";

export function useChat() {
  const queryClient = useQueryClient();

  const { data: threads = [], isLoading: isLoadingThreads } = useQuery<Thread[]>({
    queryKey: ["threads"],
    queryFn: async () => {
      const response = await fetch("/api/threads");
      if (!response.ok) throw new Error("Failed to fetch threads");
      return response.json();
    },
  });

  const getMessages = async (threadId: number) => {
    const response = await fetch(`/api/threads/${threadId}/messages`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
  };

  const createThread = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Failed to create thread");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({
      threadId,
      message,
    }: {
      threadId: number;
      message: string;
    }) => {
      const response = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to send message");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.threadId],
      });
    },
  });

  const deleteThread = useMutation({
    mutationFn: async (threadId: number) => {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete thread");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  return {
    threads,
    isLoadingThreads,
    getMessages,
    createThread: createThread.mutateAsync,
    sendMessage: sendMessage.mutateAsync,
    deleteThread: deleteThread.mutateAsync,
  };
}
