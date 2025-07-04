import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { verifyToken, setupSimpleAuth } from "./simpleAuth";
import { 
  insertEquipmentSchema, 
  insertReservationSchema,
  insertUsageLogSchema,
  insertNotificationSchema,
  insertMaintenanceRecordSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup simple authentication
  setupSimpleAuth(app);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.get('/api/auth/user', verifyToken, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Equipment routes
  app.get('/api/equipment', verifyToken, async (req, res) => {
    try {
      const equipment = await storage.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get('/api/equipment/:id', verifyToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipment = await storage.getEquipmentById(id);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post('/api/equipment', verifyToken, async (req: any, res) => {
    try {
      const user = req.user.claims;
      if (user.role !== 'admin' && user.role !== 'faculty') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(validatedData);
      res.json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating equipment:", error);
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  app.patch('/api/equipment/:id/status', verifyToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const equipment = await storage.updateEquipmentStatus(id, status);
      res.json(equipment);
    } catch (error) {
      console.error("Error updating equipment status:", error);
      res.status(500).json({ message: "Failed to update equipment status" });
    }
  });

  // Reservation routes
  app.get('/api/reservations', verifyToken, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.role || 'student';
      
      let reservations;
      if (userRole === 'student') {
        reservations = await storage.getUserReservations(userId);
      } else {
        reservations = await storage.getAllReservations();
      }
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  app.post('/api/reservations', verifyToken, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReservationSchema.parse({
        ...req.body,
        userId,
      });
      
      const reservation = await storage.createReservation(validatedData);
      
      // Create notification for approval
      await storage.createNotification({
        userId: "admin", // In reality, this would be dynamic based on equipment category
        title: "New Reservation Request",
        message: `A new reservation request has been submitted for ${req.body.equipmentName}`,
        type: "info",
        relatedEntityType: "reservation",
        relatedEntityId: reservation.id,
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

  app.patch('/api/reservations/:id/approve', verifyToken, async (req: any, res) => {
    try {
      const user = req.user.claims;
      if (user.role === 'student') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const reservation = await storage.updateReservationStatus(id, status, user.sub, notes);
      
      // Create notification for user
      const reservationDetails = await storage.getReservationById(id);
      if (reservationDetails) {
        await storage.createNotification({
          userId: reservationDetails.user.id,
          title: `Reservation ${status}`,
          message: `Your reservation for ${reservationDetails.equipment.name} has been ${status}`,
          type: status === 'approved' ? 'success' : 'warning',
          relatedEntityType: "reservation",
          relatedEntityId: id,
        });
      }
      
      res.json(reservation);
    } catch (error) {
      console.error("Error updating reservation:", error);
      res.status(500).json({ message: "Failed to update reservation" });
    }
  });

  app.get('/api/reservations/pending', verifyToken, async (req: any, res) => {
    try {
      const user = req.user.claims;
      if (user.role === 'student') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const reservations = await storage.getPendingReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching pending reservations:", error);
      res.status(500).json({ message: "Failed to fetch pending reservations" });
    }
  });

  // Usage log routes
  app.post('/api/usage-logs', verifyToken, async (req: any, res) => {
    try {
      const validatedData = insertUsageLogSchema.parse(req.body);
      const log = await storage.createUsageLog(validatedData);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating usage log:", error);
      res.status(500).json({ message: "Failed to create usage log" });
    }
  });

  app.get('/api/equipment/:id/usage-logs', verifyToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getEquipmentUsageLogs(id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching usage logs:", error);
      res.status(500).json({ message: "Failed to fetch usage logs" });
    }
  });

  // Notification routes
  app.get('/api/notifications', verifyToken, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', verifyToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/dashboard', verifyToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const popularEquipment = await storage.getPopularEquipment();
      res.json({ stats, popularEquipment });
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  app.get('/api/analytics/equipment-utilization', verifyToken, async (req, res) => {
    try {
      const utilization = await storage.getEquipmentUtilization();
      res.json(utilization);
    } catch (error) {
      console.error("Error fetching equipment utilization:", error);
      res.status(500).json({ message: "Failed to fetch equipment utilization" });
    }
  });

  // Maintenance routes
  app.post('/api/maintenance', verifyToken, async (req: any, res) => {
    try {
      const user = req.user.claims;
      if (user.role === 'student') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertMaintenanceRecordSchema.parse({
        ...req.body,
        performedBy: user.sub,
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

  app.get('/api/equipment/:id/maintenance', verifyToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const records = await storage.getEquipmentMaintenance(id);
      res.json(records);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      res.status(500).json({ message: "Failed to fetch maintenance records" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);
        
        // Echo back for now - in production, this would handle specific message types
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'echo', data }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    // Send initial connection confirmation
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));
    }
  });

  return httpServer;
} 