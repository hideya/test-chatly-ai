import { type Express } from "express";
import passport from "passport";
import { IVerifyOptions } from "passport-local";
import { setupAuth } from "./auth";
import { crypto } from "./auth";
import { db } from "../db";
import { chatThreads, chatMessages, users, insertUserSchema } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { generateChatResponse, generateThreadTitle } from "./openai";

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { username, password } = result.data;

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      // Hash the password
      const hashedPassword = await crypto.hash(password);

      // Create the new user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      // Log the user in after registration
      req.login(newUser, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          message: "Registration successful",
          user: { id: newUser.id, username: newUser.username },
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
    }

    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send(info.message ?? "Login failed");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json({
          message: "Login successful",
          user: { id: user.id, username: user.username },
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Not logged in");
  });

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
          title: title || "New Chat",
          createdAt: new Date(),
        })
        .returning();

      const [userMessage] = await db
        .insert(chatMessages)
        .values({
          threadId: thread.id,
          role: "user",
          content: message,
          createdAt: new Date(),
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
          content: aiResponse.content || "",
          createdAt: new Date(),
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
          createdAt: new Date(),
        })
        .returning();

      const aiResponse = await generateChatResponse([
        ...messages.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ]);

      const [assistantMessage] = await db
        .insert(chatMessages)
        .values({
          threadId: parseInt(req.params.threadId),
          role: "assistant",
          content: aiResponse.content || "",
          createdAt: new Date(),
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
