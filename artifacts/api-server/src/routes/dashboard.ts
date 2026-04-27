import { Router } from "express";
import { db } from "@workspace/db";
import { volunteersTable, missionsTable, ngosTable, resourcesTable, activityTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/summary", authMiddleware, async (req, res) => {
  try {
    const volunteers = await db.select().from(volunteersTable);
    const missions = await db.select().from(missionsTable);
    const ngos = await db.select().from(ngosTable);
    const resources = await db.select().from(resourcesTable);

    const totalVolunteers = volunteers.length;
    const activeVolunteers = volunteers.filter(v => v.status === "active").length;
    const totalMissions = missions.length;
    const activeMissions = missions.filter(m => m.status === "active").length;
    const completedMissions = missions.filter(m => m.status === "completed").length;
    const criticalMissions = missions.filter(m => m.urgency === "critical" && m.status !== "completed").length;
    const totalNgos = ngos.length;
    const totalResources = resources.reduce((sum, r) => sum + r.quantity, 0);
    const totalImpactHours = volunteers.reduce((sum, v) => sum + (v.totalHours || 0), 0);
    const beneficiariesReached = completedMissions * 150;

    return res.json({ totalVolunteers, activeVolunteers, totalMissions, activeMissions, completedMissions, criticalMissions, totalNgos, totalResources, totalImpactHours, beneficiariesReached });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/dashboard/activity", authMiddleware, async (req, res) => {
  try {
    const rows = await db.select().from(activityTable).orderBy(desc(activityTable.timestamp)).limit(20);
    return res.json(rows);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

router.get("/dashboard/district-stats", authMiddleware, async (req, res) => {
  try {
    const volunteers = await db.select().from(volunteersTable);
    const missions = await db.select().from(missionsTable);
    const resources = await db.select().from(resourcesTable);

    const districtMap = new Map<string, { volunteers: number; missions: number; resources: number; urgencyScore: number }>();

    for (const v of volunteers) {
      const d = districtMap.get(v.district) || { volunteers: 0, missions: 0, resources: 0, urgencyScore: 0 };
      d.volunteers++;
      districtMap.set(v.district, d);
    }
    for (const m of missions) {
      const d = districtMap.get(m.district) || { volunteers: 0, missions: 0, resources: 0, urgencyScore: 0 };
      d.missions++;
      if (m.urgency === "critical") d.urgencyScore += 4;
      else if (m.urgency === "high") d.urgencyScore += 3;
      else if (m.urgency === "medium") d.urgencyScore += 2;
      else d.urgencyScore += 1;
      districtMap.set(m.district, d);
    }
    for (const r of resources) {
      const d = districtMap.get(r.district) || { volunteers: 0, missions: 0, resources: 0, urgencyScore: 0 };
      d.resources += r.quantity;
      districtMap.set(r.district, d);
    }

    const result = Array.from(districtMap.entries()).map(([district, stats]) => ({ district, ...stats }));
    return res.json(result);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Failed" }); }
});

export default router;
