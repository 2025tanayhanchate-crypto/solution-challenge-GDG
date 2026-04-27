import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

const SAHAAX_SYSTEM_PROMPT = "You are SahaayX Assistant, an intelligent AI guide for India's volunteer coordination and social impact platform. You help coordinate disaster relief, volunteer matching, community resource allocation, and social welfare missions. Be helpful, concise, and professional. Answer questions about social impact, NGO coordination, volunteer management, and government welfare programs.";

router.get("/gemini/conversations", authMiddleware, async (req, res) => {
  try {
    const rows = await db.select().from(conversationsTable).orderBy(conversationsTable.createdAt);
    return res.json(rows);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/gemini/conversations", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const [row] = await db.insert(conversationsTable).values({ title: title || "New Chat" }).returning();
    return res.status(201).json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/gemini/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    if (!conv) return res.status(404).json({ error: "Not found" });
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(asc(messagesTable.createdAt));
    return res.json({ ...conv, messages: msgs });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.delete("/gemini/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    if (!conv) return res.status(404).json({ error: "Not found" });
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    return res.status(204).send();
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/gemini/conversations/:id/messages", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(asc(messagesTable.createdAt));
    return res.json(msgs);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/gemini/conversations/:id/messages", authMiddleware, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    await db.insert(messagesTable).values({ conversationId, role: "user", content });

    const history = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversationId)).orderBy(asc(messagesTable.createdAt));

    const chatMessages = history.map(m => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }],
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: chatMessages,
      config: {
        maxOutputTokens: 8192,
        systemInstruction: SAHAAX_SYSTEM_PROMPT,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({ conversationId, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err);
    res.write(`data: ${JSON.stringify({ error: "AI request failed" })}\n\n`);
    res.end();
  }
});

router.post("/gemini/analyze-survey", authMiddleware, async (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData) return res.status(400).json({ error: "csvData required" });

    const prompt = `You are a social welfare data analyst. Analyze this community survey data and return a JSON with: top5_needs (array of {category, severity (1-10), affected_population, recommended_action}), overall_risk_level (Low/Medium/High/Critical), key_insights (array of 3 strings), priority_districts (array of strings). Return only valid JSON with no markdown. Data: ${csvData}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });

    const text = response.text ?? "{}";
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router;
