import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable, volunteersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

router.get("/anthropic/conversations", authMiddleware, async (req, res) => {
  try {
    const rows = await db.select().from(conversationsTable).orderBy(conversationsTable.createdAt);
    return res.json(rows);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/anthropic/conversations", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const [row] = await db.insert(conversationsTable).values({ title: title || "New Chat" }).returning();
    return res.status(201).json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/anthropic/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    if (!conv) return res.status(404).json({ error: "Not found" });
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(asc(messagesTable.createdAt));
    return res.json({ ...conv, messages: msgs });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.delete("/anthropic/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    if (!conv) return res.status(404).json({ error: "Not found" });
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    return res.status(204).send();
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/anthropic/conversations/:id/messages", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(asc(messagesTable.createdAt));
    return res.json(msgs);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/anthropic/conversations/:id/messages", authMiddleware, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    await db.insert(messagesTable).values({ conversationId, role: "user", content });

    const history = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversationId)).orderBy(asc(messagesTable.createdAt));
    const chatMessages = history.map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: "You are SahaayX Assistant powered by Claude, helping coordinate volunteer activities and social impact missions across India.",
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
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

router.post("/anthropic/match-volunteers", authMiddleware, async (req, res) => {
  try {
    const { missionDescription, requiredSkills, district } = req.body;
    const volunteers = await db.select().from(volunteersTable).where(eq(volunteersTable.status, "active")).limit(20);

    const volunteerList = volunteers.map(v => {
      const skills = (() => { try { return JSON.parse(v.skills); } catch { return []; } })();
      return `ID:${v.id}, Name:${v.name}, District:${v.district}, Skills:[${skills.join(",")}], Hours:${v.totalHours}`;
    }).join("\n");

    const prompt = `You are a volunteer matching AI. Match the best volunteers for this mission.
Mission: ${missionDescription}
Required Skills: ${requiredSkills?.join(", ")}
District: ${district}

Available Volunteers:
${volunteerList}

Return JSON: { "matches": [{"volunteerId": number, "volunteerName": string, "matchScore": number (0-100), "reasoning": string}], "summary": string }
Only JSON, no markdown.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    const text = block.type === "text" ? block.text : "{}";
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      return res.status(500).json({ error: "Failed to parse matching response" });
    }
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Volunteer matching failed" });
  }
});

export default router;
