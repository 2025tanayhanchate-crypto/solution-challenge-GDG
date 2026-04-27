import { db } from "@workspace/db";
import {
  usersTable, volunteersTable, ngosTable, missionsTable, resourcesTable, reportsTable, activityTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("sahaax123", 10);

  const existingUsers = await db.select().from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    console.log("Already seeded, skipping.");
    process.exit(0);
  }

  const [admin] = await db.insert(usersTable).values([
    { name: "Arjun Sharma", email: "admin@sahaax.in", passwordHash, role: "government" },
    { name: "Priya Nair", email: "ngo@sahaax.in", passwordHash, role: "ngo_admin" },
    { name: "Ravi Kumar", email: "volunteer@sahaax.in", passwordHash, role: "volunteer" },
    { name: "Inspector Mehta", email: "police@sahaax.in", passwordHash, role: "police" },
  ]).returning();

  await db.insert(ngosTable).values([
    { name: "Seva Foundation", registrationNumber: "NGO-MH-2019-0041", district: "Mumbai", category: "Disaster Relief", contactEmail: "seva@foundation.org", phone: "022-44556677", status: "active" },
    { name: "Green Earth Initiative", registrationNumber: "NGO-DL-2020-0112", district: "Delhi", category: "Environment", contactEmail: "info@greenearth.in", phone: "011-23456789", status: "active" },
    { name: "Aarogya Sewa", registrationNumber: "NGO-KA-2018-0033", district: "Bengaluru", category: "Healthcare", contactEmail: "contact@aarogya.in", phone: "080-99887766", status: "active" },
    { name: "Shiksha Daan", registrationNumber: "NGO-RJ-2021-0085", district: "Jaipur", category: "Education", contactEmail: "shiksha@daan.org", phone: "0141-3344556", status: "active" },
  ]);

  await db.insert(volunteersTable).values([
    { name: "Anjali Mehta", email: "anjali@example.com", phone: "9876543210", district: "Mumbai", skills: JSON.stringify(["First Aid", "Disaster Relief", "Logistics"]), availability: "weekends", status: "active", totalHours: 245, missionsCompleted: 12, badge: "gold" },
    { name: "Suresh Patel", email: "suresh@example.com", phone: "9988776655", district: "Delhi", skills: JSON.stringify(["Medical", "Crisis Management", "Communication"]), availability: "full-time", status: "active", totalHours: 410, missionsCompleted: 23, badge: "platinum" },
    { name: "Deepa Rao", email: "deepa@example.com", phone: "8877665544", district: "Bengaluru", skills: JSON.stringify(["Teaching", "Child Welfare", "Counseling"]), availability: "weekdays", status: "active", totalHours: 180, missionsCompleted: 9, badge: "silver" },
    { name: "Vikram Singh", email: "vikram@example.com", phone: "7766554433", district: "Jaipur", skills: JSON.stringify(["Construction", "Water Supply", "Heavy Machinery"]), availability: "weekends", status: "active", totalHours: 320, missionsCompleted: 15, badge: "gold" },
    { name: "Fatima Shaikh", email: "fatima@example.com", phone: "6655443322", district: "Hyderabad", skills: JSON.stringify(["Translation", "Community Outreach", "Documentation"]), availability: "evenings", status: "active", totalHours: 95, missionsCompleted: 6, badge: "bronze" },
    { name: "Rahul Joshi", email: "rahul@example.com", phone: "5544332211", district: "Pune", skills: JSON.stringify(["IT Support", "Data Entry", "Training"]), availability: "full-time", status: "inactive", totalHours: 55, missionsCompleted: 3, badge: null },
    { name: "Kavya Nambiar", email: "kavya@example.com", phone: "4433221100", district: "Chennai", skills: JSON.stringify(["Nursing", "First Aid", "Elder Care"]), availability: "weekends", status: "active", totalHours: 510, missionsCompleted: 28, badge: "platinum" },
    { name: "Amit Thakur", email: "amit@example.com", phone: "3322110099", district: "Kolkata", skills: JSON.stringify(["Cooking", "Food Distribution", "Supply Chain"]), availability: "full-time", status: "active", totalHours: 200, missionsCompleted: 11, badge: "silver" },
  ]);

  const [m1, m2, m3, m4] = await db.insert(missionsTable).values([
    { title: "Flood Relief Operations - Assam", description: "Emergency relief for flood-affected families. Distribution of food, water, medicines.", category: "Disaster Relief", district: "Guwahati", urgency: "critical", requiredSkills: JSON.stringify(["First Aid", "Logistics", "Disaster Relief"]), volunteersNeeded: 50, volunteersAssigned: 32, status: "active", ngoName: "Seva Foundation" },
    { title: "Community Health Camps - Rural Karnataka", description: "Mobile health screening camps for remote villages. Focus on TB, malaria, and maternal health.", category: "Healthcare", district: "Bengaluru", urgency: "high", requiredSkills: JSON.stringify(["Medical", "Nursing", "First Aid"]), volunteersNeeded: 20, volunteersAssigned: 14, status: "active", ngoName: "Aarogya Sewa" },
    { title: "Digital Literacy Drive - Rajasthan", description: "Teaching basic computer and smartphone skills to youth in rural areas.", category: "Education", district: "Jaipur", urgency: "medium", requiredSkills: JSON.stringify(["IT Support", "Teaching", "Training"]), volunteersNeeded: 15, volunteersAssigned: 10, status: "active", ngoName: "Shiksha Daan" },
    { title: "Tree Plantation - Delhi NCR", description: "Urban plantation drive across 50 neighborhoods. Target: 10,000 saplings.", category: "Environment", district: "Delhi", urgency: "low", requiredSkills: JSON.stringify(["Community Outreach", "Logistics"]), volunteersNeeded: 100, volunteersAssigned: 67, status: "active", ngoName: "Green Earth Initiative" },
    { title: "Winter Relief Distribution - Himachal Pradesh", description: "Blanket and warm clothes distribution for high-altitude villages before snowfall.", category: "Welfare", district: "Shimla", urgency: "high", requiredSkills: JSON.stringify(["Supply Chain", "Logistics", "Community Outreach"]), volunteersNeeded: 25, volunteersAssigned: 25, status: "completed", ngoName: "Seva Foundation" },
  ]).returning();

  await db.insert(resourcesTable).values([
    { name: "Medical Kits", category: "Medical", district: "Mumbai", quantity: 500, unit: "units", status: "available" },
    { name: "Food Packets", category: "Food", district: "Guwahati", quantity: 10000, unit: "packets", status: "allocated", allocatedToMissionId: m1.id },
    { name: "Water Purification Tablets", category: "Water", district: "Guwahati", quantity: 25000, unit: "tablets", status: "allocated", allocatedToMissionId: m1.id },
    { name: "Tents", category: "Shelter", district: "Guwahati", quantity: 200, unit: "units", status: "allocated", allocatedToMissionId: m1.id },
    { name: "Blankets", category: "Clothing", district: "Shimla", quantity: 1500, unit: "pieces", status: "available" },
    { name: "Laptops", category: "Equipment", district: "Jaipur", quantity: 30, unit: "units", status: "allocated", allocatedToMissionId: m3.id },
    { name: "Medicines - ORS Sachets", category: "Medical", district: "Bengaluru", quantity: 8000, unit: "sachets", status: "allocated", allocatedToMissionId: m2.id },
    { name: "Tree Saplings", category: "Environmental", district: "Delhi", quantity: 10000, unit: "saplings", status: "allocated", allocatedToMissionId: m4.id },
  ]);

  await db.insert(reportsTable).values([
    { title: "Assam Flood Impact Assessment - April 2025", type: "field", district: "Guwahati", content: "Over 45,000 families displaced. 32 villages submerged. Immediate need: food, water, shelter. Medical supplies critical for preventing waterborne diseases.", submittedBy: "Arjun Sharma", status: "approved" },
    { title: "Karnataka Health Camp Q1 Report", type: "performance", district: "Bengaluru", content: "3,200 patients screened. 145 referred for specialist care. TB screening positive rate 2.3%. Significant improvement in maternal health awareness.", submittedBy: "Priya Nair", status: "approved" },
    { title: "Digital India Progress - Rajasthan Q2", type: "impact", district: "Jaipur", content: "780 youth trained in basic digital literacy. 92% completion rate. 340 youth now enrolled in online government services.", submittedBy: "Priya Nair", status: "pending" },
  ]);

  await db.insert(activityTable).values([
    { type: "mission_created", description: "New critical mission: Flood Relief Operations - Assam", district: "Guwahati", timestamp: new Date(Date.now() - 3600000) },
    { type: "volunteer_assigned", description: "Suresh Patel assigned to Assam Flood Relief Operations", district: "Guwahati", timestamp: new Date(Date.now() - 3200000) },
    { type: "resource_allocated", description: "10,000 food packets allocated to Assam flood mission", district: "Guwahati", timestamp: new Date(Date.now() - 2800000) },
    { type: "mission_completed", description: "Winter Relief Distribution - Himachal Pradesh completed successfully", district: "Shimla", timestamp: new Date(Date.now() - 86400000) },
    { type: "volunteer_registered", description: "Kavya Nambiar registered as platinum volunteer", district: "Chennai", timestamp: new Date(Date.now() - 172800000) },
    { type: "ngo_joined", description: "Aarogya Sewa registered on SahaayX platform", district: "Bengaluru", timestamp: new Date(Date.now() - 259200000) },
  ]);

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
