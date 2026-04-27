import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  district: text("district").notNull(),
  urgency: text("urgency").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  requiredSkills: text("required_skills").notNull().default("[]"),
  volunteersNeeded: integer("volunteers_needed").notNull().default(1),
  volunteersAssigned: integer("volunteers_assigned").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  ngoId: integer("ngo_id"),
  ngoName: text("ngo_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const missionAssignmentsTable = pgTable("mission_assignments", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").notNull(),
  volunteerId: integer("volunteer_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const insertMissionSchema = createInsertSchema(missionsTable).omit({ id: true, createdAt: true });
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missionsTable.$inferSelect;
