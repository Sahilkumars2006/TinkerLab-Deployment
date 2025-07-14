import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment categories enum
export const equipmentCategoryEnum = pgEnum("equipment_category", [
  "mechanical",
  "electronics", 
  "testing",
  "printing",
  "machining"
]);

// Equipment status enum
export const equipmentStatusEnum = pgEnum("equipment_status", [
  "available",
  "in_use",
  "maintenance",
  "out_of_order"
]);

// Equipment table
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: equipmentCategoryEnum("category").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  status: equipmentStatusEnum("status").notNull().default("available"),
  imageUrl: varchar("image_url"),
  specifications: jsonb("specifications"),
  safetyRequirements: text("safety_requirements"),
  maxUsageDuration: integer("max_usage_duration"), // in hours
  requiresTraining: boolean("requires_training").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reservation status enum
export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "approved",
  "rejected",
  "active",
  "completed",
  "cancelled"
]);

// Reservations table
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  purpose: text("purpose").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: reservationStatusEnum("status").notNull().default("pending"),
  approvedBy: varchar("approved_by"),
  approvalNotes: text("approval_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment usage logs
export const usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull(),
  userId: varchar("user_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  checkedOutAt: timestamp("checked_out_at"),
  checkedInAt: timestamp("checked_in_at"),
  actualUsageDuration: integer("actual_usage_duration"), // in minutes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Training records
export const trainingRecords = pgTable("training_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  expiresAt: timestamp("expires_at"),
  certifiedBy: varchar("certified_by").notNull(),
  score: integer("score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default("info"), // info, warning, error, success
  isRead: boolean("is_read").notNull().default(false),
  relatedEntityType: varchar("related_entity_type"), // reservation, equipment, etc.
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Maintenance records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  performedBy: varchar("performed_by").notNull(),
  description: text("description").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  cost: integer("cost"), // in cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
  usageLogs: many(usageLogs),
  trainingRecords: many(trainingRecords),
  notifications: many(notifications),
}));

export const equipmentRelations = relations(equipment, ({ many }) => ({
  reservations: many(reservations),
  usageLogs: many(usageLogs),
  trainingRecords: many(trainingRecords),
  maintenanceRecords: many(maintenanceRecords),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  equipment: one(equipment, {
    fields: [reservations.equipmentId],
    references: [equipment.id],
  }),
  approver: one(users, {
    fields: [reservations.approvedBy],
    references: [users.id],
  }),
  usageLogs: many(usageLogs),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  reservation: one(reservations, {
    fields: [usageLogs.reservationId],
    references: [reservations.id],
  }),
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id],
  }),
  equipment: one(equipment, {
    fields: [usageLogs.equipmentId],
    references: [equipment.id],
  }),
}));

export const trainingRecordsRelations = relations(trainingRecords, ({ one }) => ({
  user: one(users, {
    fields: [trainingRecords.userId],
    references: [users.id],
  }),
  equipment: one(equipment, {
    fields: [trainingRecords.equipmentId],
    references: [equipment.id],
  }),
  certifier: one(users, {
    fields: [trainingRecords.certifiedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenanceRecords.equipmentId],
    references: [equipment.id],
  }),
  performer: one(users, {
    fields: [maintenanceRecords.performedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  status: true,
  approvedBy: true,
  approvalNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageLogSchema = createInsertSchema(usageLogs).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingRecordSchema = createInsertSchema(trainingRecords).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Equipment = {
  id: number;
  name: string;
  description: string | null; // Explicitly define as string or null
  category: string;
  location: string;
  status: string;
  imageUrl: string | null;
  specifications: any; // Consider using a more specific type if possible
  safetyRequirements: string | null; // Explicitly define as string or null
  maxUsageDuration: number | null; // Explicitly define as number or null
  requiresTraining: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = z.infer<typeof insertUsageLogSchema>;
export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

// API Response Types
export interface DashboardStats {
  equipment: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  reservations: {
    active: number;
    pending: number;
    completed: number;
  };
}

export interface PopularEquipment {
  id: number;
  name: string;
  category: string;
  location: string;
  status: string;
  imageUrl?: string | null;
  totalReservations: number;
}

export interface EquipmentUtilization {
  equipmentId: number;
  name: string;
  category: string;
  totalReservations: number;
  totalUsageHours: number | null;
  avgUsageDuration: number | null;
}

export interface DashboardAnalytics {
  stats: DashboardStats;
  popularEquipment: PopularEquipment[];
}
