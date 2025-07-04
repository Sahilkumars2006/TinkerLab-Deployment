var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  equipment: () => equipment,
  equipmentCategoryEnum: () => equipmentCategoryEnum,
  equipmentRelations: () => equipmentRelations,
  equipmentStatusEnum: () => equipmentStatusEnum,
  insertEquipmentSchema: () => insertEquipmentSchema,
  insertMaintenanceRecordSchema: () => insertMaintenanceRecordSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertReservationSchema: () => insertReservationSchema,
  insertTrainingRecordSchema: () => insertTrainingRecordSchema,
  insertUsageLogSchema: () => insertUsageLogSchema,
  insertUserSchema: () => insertUserSchema,
  maintenanceRecords: () => maintenanceRecords,
  maintenanceRecordsRelations: () => maintenanceRecordsRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  reservationStatusEnum: () => reservationStatusEnum,
  reservations: () => reservations,
  reservationsRelations: () => reservationsRelations,
  sessions: () => sessions,
  trainingRecords: () => trainingRecords,
  trainingRecordsRelations: () => trainingRecordsRelations,
  usageLogs: () => usageLogs,
  usageLogsRelations: () => usageLogsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
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
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var equipmentCategoryEnum = pgEnum("equipment_category", [
  "mechanical",
  "electronics",
  "testing",
  "printing",
  "machining"
]);
var equipmentStatusEnum = pgEnum("equipment_status", [
  "available",
  "in_use",
  "maintenance",
  "out_of_order"
]);
var equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: equipmentCategoryEnum("category").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  status: equipmentStatusEnum("status").notNull().default("available"),
  imageUrl: varchar("image_url"),
  specifications: jsonb("specifications"),
  safetyRequirements: text("safety_requirements"),
  maxUsageDuration: integer("max_usage_duration"),
  // in hours
  requiresTraining: boolean("requires_training").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "approved",
  "rejected",
  "active",
  "completed",
  "cancelled"
]);
var reservations = pgTable("reservations", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull(),
  userId: varchar("user_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  checkedOutAt: timestamp("checked_out_at"),
  checkedInAt: timestamp("checked_in_at"),
  actualUsageDuration: integer("actual_usage_duration"),
  // in minutes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var trainingRecords = pgTable("training_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  expiresAt: timestamp("expires_at"),
  certifiedBy: varchar("certified_by").notNull(),
  score: integer("score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default("info"),
  // info, warning, error, success
  isRead: boolean("is_read").notNull().default(false),
  relatedEntityType: varchar("related_entity_type"),
  // reservation, equipment, etc.
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  performedBy: varchar("performed_by").notNull(),
  description: text("description").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  cost: integer("cost"),
  // in cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
  usageLogs: many(usageLogs),
  trainingRecords: many(trainingRecords),
  notifications: many(notifications)
}));
var equipmentRelations = relations(equipment, ({ many }) => ({
  reservations: many(reservations),
  usageLogs: many(usageLogs),
  trainingRecords: many(trainingRecords),
  maintenanceRecords: many(maintenanceRecords)
}));
var reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id]
  }),
  equipment: one(equipment, {
    fields: [reservations.equipmentId],
    references: [equipment.id]
  }),
  approver: one(users, {
    fields: [reservations.approvedBy],
    references: [users.id]
  }),
  usageLogs: many(usageLogs)
}));
var usageLogsRelations = relations(usageLogs, ({ one }) => ({
  reservation: one(reservations, {
    fields: [usageLogs.reservationId],
    references: [reservations.id]
  }),
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id]
  }),
  equipment: one(equipment, {
    fields: [usageLogs.equipmentId],
    references: [equipment.id]
  })
}));
var trainingRecordsRelations = relations(trainingRecords, ({ one }) => ({
  user: one(users, {
    fields: [trainingRecords.userId],
    references: [users.id]
  }),
  equipment: one(equipment, {
    fields: [trainingRecords.equipmentId],
    references: [equipment.id]
  }),
  certifier: one(users, {
    fields: [trainingRecords.certifiedBy],
    references: [users.id]
  })
}));
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));
var maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenanceRecords.equipmentId],
    references: [equipment.id]
  }),
  performer: one(users, {
    fields: [maintenanceRecords.performedBy],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true
});
var insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  status: true,
  approvedBy: true,
  approvalNotes: true,
  createdAt: true,
  updatedAt: true
});
var insertUsageLogSchema = createInsertSchema(usageLogs).omit({
  id: true,
  createdAt: true
});
var insertTrainingRecordSchema = createInsertSchema(trainingRecords).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true
});
var insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql, count, avg, sum } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Equipment operations
  async getAllEquipment() {
    return await db.select().from(equipment).where(eq(equipment.isActive, true)).orderBy(equipment.name);
  }
  async getEquipmentById(id) {
    const [item] = await db.select().from(equipment).where(eq(equipment.id, id));
    return item;
  }
  async createEquipment(equipmentData) {
    const [item] = await db.insert(equipment).values(equipmentData).returning();
    return item;
  }
  async updateEquipment(id, updates) {
    const [item] = await db.update(equipment).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(equipment.id, id)).returning();
    return item;
  }
  async updateEquipmentStatus(id, status) {
    const [item] = await db.update(equipment).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(equipment.id, id)).returning();
    return item;
  }
  // Reservation operations
  async getAllReservations() {
    return await db.select({
      id: reservations.id,
      purpose: reservations.purpose,
      startTime: reservations.startTime,
      endTime: reservations.endTime,
      status: reservations.status,
      approvalNotes: reservations.approvalNotes,
      createdAt: reservations.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      },
      equipment: {
        id: equipment.id,
        name: equipment.name,
        location: equipment.location
      }
    }).from(reservations).leftJoin(users, eq(reservations.userId, users.id)).leftJoin(equipment, eq(reservations.equipmentId, equipment.id)).orderBy(desc(reservations.createdAt));
  }
  async getReservationById(id) {
    const [reservation] = await db.select({
      id: reservations.id,
      purpose: reservations.purpose,
      startTime: reservations.startTime,
      endTime: reservations.endTime,
      status: reservations.status,
      approvalNotes: reservations.approvalNotes,
      createdAt: reservations.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      },
      equipment: {
        id: equipment.id,
        name: equipment.name,
        location: equipment.location
      }
    }).from(reservations).leftJoin(users, eq(reservations.userId, users.id)).leftJoin(equipment, eq(reservations.equipmentId, equipment.id)).where(eq(reservations.id, id));
    return reservation;
  }
  async getUserReservations(userId) {
    return await db.select({
      id: reservations.id,
      purpose: reservations.purpose,
      startTime: reservations.startTime,
      endTime: reservations.endTime,
      status: reservations.status,
      approvalNotes: reservations.approvalNotes,
      createdAt: reservations.createdAt,
      equipment: {
        id: equipment.id,
        name: equipment.name,
        location: equipment.location
      }
    }).from(reservations).leftJoin(equipment, eq(reservations.equipmentId, equipment.id)).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
  }
  async createReservation(reservationData) {
    const [reservation] = await db.insert(reservations).values(reservationData).returning();
    return reservation;
  }
  async updateReservationStatus(id, status, approvedBy, notes) {
    const [reservation] = await db.update(reservations).set({
      status,
      approvedBy,
      approvalNotes: notes,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(reservations.id, id)).returning();
    return reservation;
  }
  async getPendingReservations() {
    return await db.select({
      id: reservations.id,
      purpose: reservations.purpose,
      startTime: reservations.startTime,
      endTime: reservations.endTime,
      status: reservations.status,
      createdAt: reservations.createdAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      },
      equipment: {
        id: equipment.id,
        name: equipment.name,
        location: equipment.location
      }
    }).from(reservations).leftJoin(users, eq(reservations.userId, users.id)).leftJoin(equipment, eq(reservations.equipmentId, equipment.id)).where(eq(reservations.status, "pending")).orderBy(reservations.createdAt);
  }
  // Usage log operations
  async createUsageLog(usageLogData) {
    const [log2] = await db.insert(usageLogs).values(usageLogData).returning();
    return log2;
  }
  async getEquipmentUsageLogs(equipmentId) {
    return await db.select({
      id: usageLogs.id,
      checkedOutAt: usageLogs.checkedOutAt,
      checkedInAt: usageLogs.checkedInAt,
      actualUsageDuration: usageLogs.actualUsageDuration,
      notes: usageLogs.notes,
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }
    }).from(usageLogs).leftJoin(users, eq(usageLogs.userId, users.id)).where(eq(usageLogs.equipmentId, equipmentId)).orderBy(desc(usageLogs.createdAt));
  }
  // Training operations
  async getUserTraining(userId) {
    return await db.select().from(trainingRecords).where(eq(trainingRecords.userId, userId)).orderBy(desc(trainingRecords.completedAt));
  }
  async createTrainingRecord(trainingData) {
    const [record] = await db.insert(trainingRecords).values(trainingData).returning();
    return record;
  }
  // Notification operations
  async getUserNotifications(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async createNotification(notificationData) {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }
  async markNotificationAsRead(id) {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
  // Maintenance operations
  async getEquipmentMaintenance(equipmentId) {
    return await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.equipmentId, equipmentId)).orderBy(desc(maintenanceRecords.createdAt));
  }
  async createMaintenanceRecord(maintenanceData) {
    const [record] = await db.insert(maintenanceRecords).values(maintenanceData).returning();
    return record;
  }
  // Analytics operations
  async getEquipmentUtilization() {
    return await db.select({
      equipmentId: equipment.id,
      name: equipment.name,
      category: equipment.category,
      totalReservations: count(reservations.id),
      totalUsageHours: sum(usageLogs.actualUsageDuration),
      avgUsageDuration: avg(usageLogs.actualUsageDuration)
    }).from(equipment).leftJoin(reservations, eq(equipment.id, reservations.equipmentId)).leftJoin(usageLogs, eq(equipment.id, usageLogs.equipmentId)).where(eq(equipment.isActive, true)).groupBy(equipment.id, equipment.name, equipment.category);
  }
  async getReservationStats() {
    const [stats] = await db.select({
      totalReservations: count(reservations.id),
      pendingReservations: sql`COUNT(CASE WHEN ${reservations.status} = 'pending' THEN 1 END)`,
      approvedReservations: sql`COUNT(CASE WHEN ${reservations.status} = 'approved' THEN 1 END)`,
      activeReservations: sql`COUNT(CASE WHEN ${reservations.status} = 'active' THEN 1 END)`
    }).from(reservations);
    return stats;
  }
  async getPopularEquipment() {
    return await db.select({
      equipmentId: equipment.id,
      name: equipment.name,
      imageUrl: equipment.imageUrl,
      location: equipment.location,
      status: equipment.status,
      category: equipment.category,
      reservationCount: count(reservations.id)
    }).from(equipment).leftJoin(reservations, eq(equipment.id, reservations.equipmentId)).where(eq(equipment.isActive, true)).groupBy(equipment.id, equipment.name, equipment.imageUrl, equipment.location, equipment.status, equipment.category).orderBy(desc(count(reservations.id))).limit(4);
  }
  async getDashboardStats() {
    const [equipmentStats] = await db.select({
      total: count(equipment.id),
      available: sql`COUNT(CASE WHEN ${equipment.status} = 'available' THEN 1 END)`,
      inUse: sql`COUNT(CASE WHEN ${equipment.status} = 'in_use' THEN 1 END)`,
      maintenance: sql`COUNT(CASE WHEN ${equipment.status} = 'maintenance' THEN 1 END)`
    }).from(equipment).where(eq(equipment.isActive, true));
    const [reservationStats] = await db.select({
      pending: sql`COUNT(CASE WHEN ${reservations.status} = 'pending' THEN 1 END)`,
      active: sql`COUNT(CASE WHEN ${reservations.status} = 'active' THEN 1 END)`
    }).from(reservations);
    return {
      equipment: equipmentStats,
      reservations: reservationStats
    };
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/equipment", isAuthenticated, async (req, res) => {
    try {
      const equipment2 = await storage.getAllEquipment();
      res.json(equipment2);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });
  app2.get("/api/equipment/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipment2 = await storage.getEquipmentById(id);
      if (!equipment2) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      res.json(equipment2);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });
  app2.post("/api/equipment", isAuthenticated, async (req, res) => {
    try {
      const user = req.user.claims;
      if (user.role !== "admin" && user.role !== "faculty") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment2 = await storage.createEquipment(validatedData);
      res.json(equipment2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating equipment:", error);
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });
  app2.patch("/api/equipment/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const equipment2 = await storage.updateEquipmentStatus(id, status);
      res.json(equipment2);
    } catch (error) {
      console.error("Error updating equipment status:", error);
      res.status(500).json({ message: "Failed to update equipment status" });
    }
  });
  app2.get("/api/reservations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.role || "student";
      let reservations2;
      if (userRole === "student") {
        reservations2 = await storage.getUserReservations(userId);
      } else {
        reservations2 = await storage.getAllReservations();
      }
      res.json(reservations2);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });
  app2.post("/api/reservations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReservationSchema.parse({
        ...req.body,
        userId
      });
      const reservation = await storage.createReservation(validatedData);
      await storage.createNotification({
        userId: "admin",
        // In reality, this would be dynamic based on equipment category
        title: "New Reservation Request",
        message: `A new reservation request has been submitted for ${req.body.equipmentName}`,
        type: "info",
        relatedEntityType: "reservation",
        relatedEntityId: reservation.id
      });
      res.json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating reservation:", error);
      res.status(500).json({ message: "Failed to create reservation" });
    }
  });
  app2.patch("/api/reservations/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const user = req.user.claims;
      if (user.role === "student") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const reservation = await storage.updateReservationStatus(id, status, user.sub, notes);
      const reservationDetails = await storage.getReservationById(id);
      if (reservationDetails) {
        await storage.createNotification({
          userId: reservationDetails.user.id,
          title: `Reservation ${status}`,
          message: `Your reservation for ${reservationDetails.equipment.name} has been ${status}`,
          type: status === "approved" ? "success" : "warning",
          relatedEntityType: "reservation",
          relatedEntityId: id
        });
      }
      res.json(reservation);
    } catch (error) {
      console.error("Error updating reservation:", error);
      res.status(500).json({ message: "Failed to update reservation" });
    }
  });
  app2.get("/api/reservations/pending", isAuthenticated, async (req, res) => {
    try {
      const user = req.user.claims;
      if (user.role === "student") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const reservations2 = await storage.getPendingReservations();
      res.json(reservations2);
    } catch (error) {
      console.error("Error fetching pending reservations:", error);
      res.status(500).json({ message: "Failed to fetch pending reservations" });
    }
  });
  app2.post("/api/usage-logs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUsageLogSchema.parse(req.body);
      const log2 = await storage.createUsageLog(validatedData);
      res.json(log2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating usage log:", error);
      res.status(500).json({ message: "Failed to create usage log" });
    }
  });
  app2.get("/api/equipment/:id/usage-logs", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getEquipmentUsageLogs(id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching usage logs:", error);
      res.status(500).json({ message: "Failed to fetch usage logs" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications2 = await storage.getUserNotifications(userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/analytics/dashboard", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const popularEquipment = await storage.getPopularEquipment();
      res.json({ stats, popularEquipment });
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });
  app2.get("/api/analytics/equipment-utilization", isAuthenticated, async (req, res) => {
    try {
      const utilization = await storage.getEquipmentUtilization();
      res.json(utilization);
    } catch (error) {
      console.error("Error fetching equipment utilization:", error);
      res.status(500).json({ message: "Failed to fetch equipment utilization" });
    }
  });
  app2.post("/api/maintenance", isAuthenticated, async (req, res) => {
    try {
      const user = req.user.claims;
      if (user.role === "student") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const validatedData = insertMaintenanceRecordSchema.parse({
        ...req.body,
        performedBy: user.sub
      });
      const record = await storage.createMaintenanceRecord(validatedData);
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating maintenance record:", error);
      res.status(500).json({ message: "Failed to create maintenance record" });
    }
  });
  app2.get("/api/equipment/:id/maintenance", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const records = await storage.getEquipmentMaintenance(id);
      res.json(records);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      res.status(500).json({ message: "Failed to fetch maintenance records" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws2) => {
    console.log("WebSocket client connected");
    ws2.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Received message:", data);
        if (ws2.readyState === WebSocket.OPEN) {
          ws2.send(JSON.stringify({ type: "echo", data }));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
    ws2.on("close", () => {
      console.log("WebSocket client disconnected");
    });
    if (ws2.readyState === WebSocket.OPEN) {
      ws2.send(JSON.stringify({ type: "connected", message: "WebSocket connection established" }));
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
