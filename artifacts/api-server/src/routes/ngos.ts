import { Router } from "express";
import { db } from "@workspace/db";
import { ngosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/ngos", authMiddleware, async (req, res) => {
  try {
    const rows = await db.select().from(ngosTable).orderBy(ngosTable.createdAt);
    return res.json(rows);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/ngos", authMiddleware, async (req, res) => {
  try {
    const { name, registrationNumber, district, category, contactEmail, phone } = req.body;
    const [row] = await db.insert(ngosTable).values({ name, registrationNumber, district, category, contactEmail, phone, status: "active" }).returning();
    return res.status(201).json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/ngos/:id", authMiddleware, async (req, res) => {
  try {
    const [row] = await db.select().from(ngosTable).where(eq(ngosTable.id, Number(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

export default router;
