import { Router } from "express";
import { db } from "@workspace/db";
import { missionsTable, missionAssignmentsTable, volunteersTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

function parseSkills(s: string): string[] {
  try { return JSON.parse(s); } catch { return []; }
}
function formatMission(m: typeof missionsTable.$inferSelect) {
  return { ...m, requiredSkills: parseSkills(m.requiredSkills) };
}

router.get("/missions", authMiddleware, async (req, res) => {
  try {
    const { status, category, district } = req.query as Record<string, string>;
    let rows = await db.select().from(missionsTable).orderBy(missionsTable.createdAt);
    if (status) rows = rows.filter(r => r.status === status);
    if (category) rows = rows.filter(r => r.category.toLowerCase() === category.toLowerCase());
    if (district) rows = rows.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    return res.json(rows.map(formatMission));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/missions", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, district, urgency, requiredSkills, volunteersNeeded, startDate, endDate, ngoId, ngoName } = req.body;
    const [row] = await db.insert(missionsTable).values({
      title, description, category, district, urgency: urgency || "medium",
      requiredSkills: JSON.stringify(requiredSkills || []),
      volunteersNeeded: volunteersNeeded || 1,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      ngoId, ngoName, status: "open",
    }).returning();
    await db.insert(activityTable).values({ type: "mission_created", description: `New mission created: ${title}`, district });
    return res.status(201).json(formatMission(row));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/missions/:id", authMiddleware, async (req, res) => {
  try {
    const [row] = await db.select().from(missionsTable).where(eq(missionsTable.id, Number(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(formatMission(row));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.put("/missions/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, urgency, status, volunteersNeeded } = req.body;
    const updates: Partial<typeof missionsTable.$inferInsert> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (urgency) updates.urgency = urgency;
    if (status) updates.status = status;
    if (volunteersNeeded) updates.volunteersNeeded = volunteersNeeded;
    const [row] = await db.update(missionsTable).set(updates).where(eq(missionsTable.id, Number(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(formatMission(row));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/missions/:id/assign", authMiddleware, async (req, res) => {
  try {
    const missionId = Number(req.params.id);
    const { volunteerId } = req.body;
    const [assignment] = await db.insert(missionAssignmentsTable).values({ missionId, volunteerId }).returning();
    await db.update(missionsTable).set({ volunteersAssigned: sql`${missionsTable.volunteersAssigned} + 1` }).where(eq(missionsTable.id, missionId));
    const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, missionId)).limit(1);
    const [volunteer] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, volunteerId)).limit(1);
    if (mission && volunteer) {
      await db.insert(activityTable).values({
        type: "volunteer_assigned",
        description: `${volunteer.name} assigned to mission: ${mission.title}`,
        district: mission.district,
      });
    }
    return res.json({ missionId: assignment.missionId, volunteerId: assignment.volunteerId, assignedAt: assignment.assignedAt });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

export default router;
