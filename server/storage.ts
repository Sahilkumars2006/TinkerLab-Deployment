import {
  users,
  equipment,
  reservations,
  usageLogs,
  trainingRecords,
  notifications,
  maintenanceRecords,
  type UpsertUser,
  type User,
  type Equipment,
  type InsertEquipment,
  type Reservation,
  type InsertReservation,
  type UsageLog,
  type InsertUsageLog,
  type TrainingRecord,
  type InsertTrainingRecord,
  type Notification,
  type InsertNotification,
  type MaintenanceRecord,
  type InsertMaintenanceRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Equipment operations
  getAllEquipment(): Promise<Equipment[]>;
  getEquipmentById(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, updates: Partial<InsertEquipment>): Promise<Equipment>;
  updateEquipmentStatus(id: number, status: string): Promise<Equipment>;
  
  // Reservation operations
  getAllReservations(): Promise<any[]>;
  getReservationById(id: number): Promise<any | undefined>;
  getUserReservations(userId: string): Promise<any[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservationStatus(id: number, status: string, approvedBy?: string, notes?: string): Promise<Reservation>;
  getPendingReservations(): Promise<any[]>;
  
  // Usage log operations
  createUsageLog(usageLog: InsertUsageLog): Promise<UsageLog>;
  getEquipmentUsageLogs(equipmentId: number): Promise<any[]>;
  
  // Training operations
  getUserTraining(userId: string): Promise<TrainingRecord[]>;
  createTrainingRecord(training: InsertTrainingRecord): Promise<TrainingRecord>;
  
  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Maintenance operations
  getEquipmentMaintenance(equipmentId: number): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(maintenance: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  
  // Analytics operations
  getEquipmentUtilization(): Promise<any[]>;
  getReservationStats(): Promise<any>;
  getPopularEquipment(): Promise<any[]>;
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Equipment operations
  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment).where(eq(equipment.isActive, true)).orderBy(equipment.name);
  }

  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    const [item] = await db.select().from(equipment).where(eq(equipment.id, id));
    return item;
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [item] = await db.insert(equipment).values(equipmentData).returning();
    return item;
  }

  async updateEquipment(id: number, updates: Partial<InsertEquipment>): Promise<Equipment> {
    const [item] = await db
      .update(equipment)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(equipment.id, id))
      .returning();
    return item;
  }

  async updateEquipmentStatus(id: number, status: string): Promise<Equipment> {
    const [item] = await db
      .update(equipment)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(equipment.id, id))
      .returning();
    return item;
  }

  // Reservation operations
  async getAllReservations(): Promise<any[]> {
    return await db
      .select({
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
          email: users.email,
        },
        equipment: {
          id: equipment.id,
          name: equipment.name,
          location: equipment.location,
        },
      })
      .from(reservations)
      .leftJoin(users, eq(reservations.userId, users.id))
      .leftJoin(equipment, eq(reservations.equipmentId, equipment.id))
      .orderBy(desc(reservations.createdAt));
  }

  async getReservationById(id: number): Promise<any | undefined> {
    const [reservation] = await db
      .select({
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
          email: users.email,
        },
        equipment: {
          id: equipment.id,
          name: equipment.name,
          location: equipment.location,
        },
      })
      .from(reservations)
      .leftJoin(users, eq(reservations.userId, users.id))
      .leftJoin(equipment, eq(reservations.equipmentId, equipment.id))
      .where(eq(reservations.id, id));
    return reservation;
  }

  async getUserReservations(userId: string): Promise<any[]> {
    return await db
      .select({
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
          location: equipment.location,
        },
      })
      .from(reservations)
      .leftJoin(equipment, eq(reservations.equipmentId, equipment.id))
      .where(eq(reservations.userId, userId))
      .orderBy(desc(reservations.createdAt));
  }

  async createReservation(reservationData: InsertReservation): Promise<Reservation> {
    const [reservation] = await db.insert(reservations).values(reservationData).returning();
    return reservation;
  }

  async updateReservationStatus(id: number, status: string, approvedBy?: string, notes?: string): Promise<Reservation> {
    const [reservation] = await db
      .update(reservations)
      .set({
        status: status as any,
        approvedBy,
        approvalNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id))
      .returning();
    return reservation;
  }

  async getPendingReservations(): Promise<any[]> {
    return await db
      .select({
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
          email: users.email,
        },
        equipment: {
          id: equipment.id,
          name: equipment.name,
          location: equipment.location,
        },
      })
      .from(reservations)
      .leftJoin(users, eq(reservations.userId, users.id))
      .leftJoin(equipment, eq(reservations.equipmentId, equipment.id))
      .where(eq(reservations.status, "pending"))
      .orderBy(reservations.createdAt);
  }

  // Usage log operations
  async createUsageLog(usageLogData: InsertUsageLog): Promise<UsageLog> {
    const [log] = await db.insert(usageLogs).values(usageLogData).returning();
    return log;
  }

  async getEquipmentUsageLogs(equipmentId: number): Promise<any[]> {
    return await db
      .select({
        id: usageLogs.id,
        checkedOutAt: usageLogs.checkedOutAt,
        checkedInAt: usageLogs.checkedInAt,
        actualUsageDuration: usageLogs.actualUsageDuration,
        notes: usageLogs.notes,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(usageLogs)
      .leftJoin(users, eq(usageLogs.userId, users.id))
      .where(eq(usageLogs.equipmentId, equipmentId))
      .orderBy(desc(usageLogs.createdAt));
  }

  // Training operations
  async getUserTraining(userId: string): Promise<TrainingRecord[]> {
    return await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.userId, userId))
      .orderBy(desc(trainingRecords.completedAt));
  }

  async createTrainingRecord(trainingData: InsertTrainingRecord): Promise<TrainingRecord> {
    const [record] = await db.insert(trainingRecords).values(trainingData).returning();
    return record;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Maintenance operations
  async getEquipmentMaintenance(equipmentId: number): Promise<MaintenanceRecord[]> {
    return await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.equipmentId, equipmentId))
      .orderBy(desc(maintenanceRecords.createdAt));
  }

  async createMaintenanceRecord(maintenanceData: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [record] = await db.insert(maintenanceRecords).values(maintenanceData).returning();
    return record;
  }

  // Analytics operations
  async getEquipmentUtilization(): Promise<any[]> {
    return await db
      .select({
        equipmentId: equipment.id,
        name: equipment.name,
        category: equipment.category,
        totalReservations: count(reservations.id),
        totalUsageHours: sum(usageLogs.actualUsageDuration),
        avgUsageDuration: avg(usageLogs.actualUsageDuration),
      })
      .from(equipment)
      .leftJoin(reservations, eq(equipment.id, reservations.equipmentId))
      .leftJoin(usageLogs, eq(equipment.id, usageLogs.equipmentId))
      .where(eq(equipment.isActive, true))
      .groupBy(equipment.id, equipment.name, equipment.category);
  }

  async getReservationStats(): Promise<any> {
    const [stats] = await db
      .select({
        totalReservations: count(reservations.id),
        pendingReservations: sql<number>`COUNT(CASE WHEN ${reservations.status} = 'pending' THEN 1 END)`,
        approvedReservations: sql<number>`COUNT(CASE WHEN ${reservations.status} = 'approved' THEN 1 END)`,
        activeReservations: sql<number>`COUNT(CASE WHEN ${reservations.status} = 'active' THEN 1 END)`,
      })
      .from(reservations);
    return stats;
  }

  async getPopularEquipment(): Promise<any[]> {
    return await db
      .select({
        equipmentId: equipment.id,
        name: equipment.name,
        imageUrl: equipment.imageUrl,
        location: equipment.location,
        status: equipment.status,
        category: equipment.category,
        reservationCount: count(reservations.id),
      })
      .from(equipment)
      .leftJoin(reservations, eq(equipment.id, reservations.equipmentId))
      .where(eq(equipment.isActive, true))
      .groupBy(equipment.id, equipment.name, equipment.imageUrl, equipment.location, equipment.status, equipment.category)
      .orderBy(desc(count(reservations.id)))
      .limit(4);
  }

  async getDashboardStats(): Promise<any> {
    const [equipmentStats] = await db
      .select({
        total: count(equipment.id),
        available: sql<number>`COUNT(CASE WHEN ${equipment.status} = 'available' THEN 1 END)`,
        inUse: sql<number>`COUNT(CASE WHEN ${equipment.status} = 'in_use' THEN 1 END)`,
        maintenance: sql<number>`COUNT(CASE WHEN ${equipment.status} = 'maintenance' THEN 1 END)`,
      })
      .from(equipment)
      .where(eq(equipment.isActive, true));

    const [reservationStats] = await db
      .select({
        pending: sql<number>`COUNT(CASE WHEN ${reservations.status} = 'pending' THEN 1 END)`,
        active: sql<number>`COUNT(CASE WHEN ${reservations.status} = 'active' THEN 1 END)`,
      })
      .from(reservations);

    return {
      equipment: equipmentStats,
      reservations: reservationStats,
    };
  }
}

export const storage = new DatabaseStorage();
