import { Router } from "express";
import { db } from "@workspace/db";
import { reportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/reports", authMiddleware, async (req, res) => {
  try {
    const rows = await db.select().from(reportsTable).orderBy(reportsTable.createdAt);
    return res.json(rows);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/reports", authMiddleware, async (req, res) => {
  try {
    const { title, type, district, content } = req.body;
    const submittedBy = req.user?.email || "Anonymous";
    const [row] = await db.insert(reportsTable).values({ title, type, district, content, submittedBy, status: "pending" }).returning();
    return res.status(201).json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/reports/:id", authMiddleware, async (req, res) => {
  try {
    const [row] = await db.select().from(reportsTable).where(eq(reportsTable.id, Number(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

export default router;
