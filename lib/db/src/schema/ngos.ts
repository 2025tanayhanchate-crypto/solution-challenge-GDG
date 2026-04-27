import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ngosTable = pgTable("ngos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number"),
  district: text("district").notNull(),
  category: text("category").notNull(),
  contactEmail: text("contact_email").notNull(),
  phone: text("phone"),
  activeVolunteers: integer("active_volunteers").notNull().default(0),
  totalMissions: integer("total_missions").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNgoSchema = createInsertSchema(ngosTable).omit({ id: true, createdAt: true });
export type InsertNgo = z.infer<typeof insertNgoSchema>;
export type Ngo = typeof ngosTable.$inferSelect;
