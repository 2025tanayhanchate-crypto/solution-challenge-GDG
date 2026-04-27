import { Router } from "express";
import { db } from "@workspace/db";
import { volunteersTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

function parseSkills(skills: string): string[] {
  try { return JSON.parse(skills); } catch { return []; }
}
function formatVolunteer(v: typeof volunteersTable.$inferSelect) {
  return { ...v, skills: parseSkills(v.skills) };
}

router.get("/volunteers", authMiddleware, async (req, res) => {
  try {
    const { status, skill, district } = req.query as Record<string, string>;
    let rows = await db.select().from(volunteersTable).orderBy(volunteersTable.createdAt);
    if (status) rows = rows.filter(r => r.status === status);
    if (district) rows = rows.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    if (skill) rows = rows.filter(r => parseSkills(r.skills).some(s => s.toLowerCase().includes(skill.toLowerCase())));
    return res.json(rows.map(formatVolunteer));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.post("/volunteers", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, district, skills, availability } = req.body;
    const [row] = await db.insert(volunteersTable).values({
      name, email, phone, district,
      skills: JSON.stringify(skills || []),
      availability,
      status: "active",
    }).returning();
    return res.status(201).json(formatVolunteer(row));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/volunteers/:id", authMiddleware, async (req, res) => {
  try {
    const [row] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, Number(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(formatVolunteer(row));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.put("/volunteers/:id", authMiddleware, async (req, res) => {
  try {
    const { name, phone, district, skills, availability, status } = req.body;
    const updates: Partial<typeof volunteersTable.$inferInsert> = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (district) updates.district = district;
    if (skills) updates.skills = JSON.stringify(skills);
    if (availability) updates.availability = availability;
    if (status) updates.status = status;
    const [row] = await db.update(volunteersTable).set(updates).where(eq(volunteersTable.id, Number(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(formatVolunteer(row));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/volunteers/:id/qr", authMiddleware, async (req, res) => {
  try {
    const [row] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, Number(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    const skills = parseSkills(row.skills);
    const qrPayload = JSON.stringify({ id: row.id, name: row.name, district: row.district, skills, badge: row.badge, timestamp: new Date().toISOString() });
    return res.json({ volunteerId: row.id, name: row.name, district: row.district, skills, badge: row.badge, qrPayload });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

export default router;
