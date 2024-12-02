import { type Express } from "express";
import { setupAuth } from "./auth";
import { db } from "../db";
import { chatThreads, chatMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { generateChatResponse, generateThreadTitle } from "./openai";

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Get all threads for user
  app.get("/api/threads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const threads = await db.query.chatThreads.findMany({
        where: eq(chatThreads.userId, req.user.id),
        orderBy: desc(chatThreads.createdAt),
      });
      res.json(threads);
    } catch (error) {
      res.status(500).send("Failed to fetch threads");
    }
  });

  // Get messages for a thread
  app.get("/api/threads/:threadId/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const messages = await db.query.chatMessages.findMany({
        where: eq(chatMessages.threadId, parseInt(req.params.threadId)),
        orderBy: desc(chatMessages.createdAt),
      });
      res.json(messages.reverse());
    } catch (error) {
      res.status(500).send("Failed to fetch messages");
    }
  });

  // Create new thread
  app.post("/api/threads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).send("Message is required");
    }

    try {
      const title = await generateThreadTitle(message);
      const [thread] = await db
        .insert(chatThreads)
        .values({
          userId: req.user.id,
          title,
        })
        .returning();

      const [userMessage] = await db
        .insert(chatMessages)
        .values({
          threadId: thread.id,
          role: "user",
          content: message,
        })
        .returning();

      const aiResponse = await generateChatResponse([
        { role: "user", content: message },
      ]);

      const [assistantMessage] = await db
        .insert(chatMessages)
        .values({
          threadId: thread.id,
          role: "assistant",
          content: aiResponse.content,
        })
        .returning();

      res.json({
        thread,
        messages: [userMessage, assistantMessage],
      });
    } catch (error) {
      res.status(500).send("Failed to create thread");
    }
  });

  // Add message to thread
  app.post("/api/threads/:threadId/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).send("Message is required");
    }

    try {
      const messages = await db.query.chatMessages.findMany({
        where: eq(chatMessages.threadId, parseInt(req.params.threadId)),
      });

      const [userMessage] = await db
        .insert(chatMessages)
        .values({
          threadId: parseInt(req.params.threadId),
          role: "user",
          content: message,
        })
        .returning();

      const aiResponse = await generateChatResponse([
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: message },
      ]);

      const [assistantMessage] = await db
        .insert(chatMessages)
        .values({
          threadId: parseInt(req.params.threadId),
          role: "assistant",
          content: aiResponse.content,
        })
        .returning();

      res.json([userMessage, assistantMessage]);
    } catch (error) {
      res.status(500).send("Failed to add message");
    }
  });

  // Delete thread
  app.delete("/api/threads/:threadId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      await db
        .delete(chatMessages)
        .where(eq(chatMessages.threadId, parseInt(req.params.threadId)));
      await db
        .delete(chatThreads)
        .where(eq(chatThreads.id, parseInt(req.params.threadId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).send("Failed to delete thread");
    }
  });
}
