import { Router } from "express";
import { db } from "@workspace/db";
import { resourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/resources", authMiddleware, async (req, res) => {
  try {
    const { category, district } = req.query as Record<string, string>;
    let rows = await db.select().from(resourcesTable).orderBy(resourcesTable.createdAt);
    if (category) rows = rows.filter(r => r.category === category);
    if (district) rows = rows.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    return res.json(rows);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/resources", authMiddleware, async (req, res) => {
  try {
    const { name, category, district, quantity, unit } = req.body;
    const [row] = await db.insert(resourcesTable).values({ name, category, district, quantity, unit, status: "available" }).returning();
    return res.status(201).json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.put("/resources/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity, status, allocatedToMissionId } = req.body;
    const updates: Partial<typeof resourcesTable.$inferInsert> = {};
    if (quantity !== undefined) updates.quantity = quantity;
    if (status) updates.status = status;
    if (allocatedToMissionId !== undefined) updates.allocatedToMissionId = allocatedToMissionId;
    const [row] = await db.update(resourcesTable).set(updates).where(eq(resourcesTable.id, Number(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

export default router;
