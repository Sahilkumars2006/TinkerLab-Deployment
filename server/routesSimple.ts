import type { Express } from "express";
// import { setupSimpleAuth } from "./simpleAuth";
// import { createServer, type Server } from "http";
// import { WebSocketServer, WebSocket } from "ws";
// import { storage } from "./storage";
// import { verifyToken } from "./simpleAuth";
// import { 
//   insertEquipmentSchema, 
//   insertReservationSchema,
//   insertUsageLogSchema,
//   insertNotificationSchema,
//   insertMaintenanceRecordSchema
// } from "@shared/schema";
// import { z } from "zod";

export function registerRoutes(app: Express): void {
  // Setup simple authentication
  // setupSimpleAuth(app);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // All other route registrations are commented out for isolation
  // ...
} 