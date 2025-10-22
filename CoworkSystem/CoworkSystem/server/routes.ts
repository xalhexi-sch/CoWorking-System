import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMemberSchema, insertSpaceSchema, insertBookingSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to require admin role
const requireAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Error checking admin role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Helper function to log activities
  async function logActivity(
    req: any,
    action: string,
    entityType: string,
    entityId?: number,
    details?: string
  ) {
    try {
      const userId = req.user?.claims?.sub;
      if (userId) {
        await storage.createActivityLog(userId, action, entityType, entityId, details);
      }
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Member routes
  app.get("/api/members", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMember(id);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  app.post("/api/members", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(validatedData);
      await logActivity(req, "CREATE", "member", member.id, `Created member: ${member.fullName}`);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating member:", error);
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  app.patch("/api/members/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const partialSchema = insertMemberSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const member = await storage.updateMember(id, validatedData);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      await logActivity(req, "UPDATE", "member", member.id, `Updated member: ${member.fullName}`);
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  // Space routes
  app.get("/api/spaces", isAuthenticated, async (req, res) => {
    try {
      const spaces = await storage.getAllSpaces();
      res.json(spaces);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      res.status(500).json({ message: "Failed to fetch spaces" });
    }
  });

  app.get("/api/spaces/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const space = await storage.getSpace(id);
      if (!space) {
        return res.status(404).json({ message: "Space not found" });
      }
      res.json(space);
    } catch (error) {
      console.error("Error fetching space:", error);
      res.status(500).json({ message: "Failed to fetch space" });
    }
  });

  app.post("/api/spaces", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertSpaceSchema.parse(req.body);
      const space = await storage.createSpace(validatedData);
      await logActivity(req, "CREATE", "space", space.id, `Created space: ${space.name}`);
      res.status(201).json(space);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating space:", error);
      res.status(500).json({ message: "Failed to create space" });
    }
  });

  app.patch("/api/spaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const partialSchema = insertSpaceSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const space = await storage.updateSpace(id, validatedData);
      if (!space) {
        return res.status(404).json({ message: "Space not found" });
      }
      await logActivity(req, "UPDATE", "space", space.id, `Updated space: ${space.name}`);
      res.json(space);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating space:", error);
      res.status(500).json({ message: "Failed to update space" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);

      // Check for booking conflicts
      const hasConflict = await storage.checkBookingConflict(
        validatedData.spaceId,
        validatedData.startTime,
        validatedData.endTime
      );

      if (hasConflict) {
        return res.status(409).json({
          message: "Booking conflict: The space is already booked during this time period",
        });
      }

      const booking = await storage.createBooking(validatedData);
      await logActivity(
        req,
        "CREATE",
        "booking",
        booking.id,
        `Created booking #${booking.id} for space ${booking.spaceId}`
      );
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const partialSchema = insertBookingSchema.partial();
      const validatedData = partialSchema.parse(req.body);

      // If updating time/space, check for conflicts
      if (validatedData.spaceId || validatedData.startTime || validatedData.endTime) {
        const existingBooking = await storage.getBooking(id);
        if (!existingBooking) {
          return res.status(404).json({ message: "Booking not found" });
        }

        const spaceId = validatedData.spaceId ?? existingBooking.spaceId;
        const startTime = validatedData.startTime ?? existingBooking.startTime;
        const endTime = validatedData.endTime ?? existingBooking.endTime;

        const hasConflict = await storage.checkBookingConflict(
          spaceId,
          startTime,
          endTime,
          id
        );

        if (hasConflict) {
          return res.status(409).json({
            message: "Booking conflict: The space is already booked during this time period",
          });
        }
      }

      const booking = await storage.updateBooking(id, validatedData);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      await logActivity(
        req,
        "UPDATE",
        "booking",
        booking.id,
        `Updated booking #${booking.id} - Status: ${booking.status}`
      );
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Payment routes
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  app.post("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      await logActivity(
        req,
        "CREATE",
        "payment",
        payment.id,
        `Recorded payment of $${payment.amount} for booking #${payment.bookingId}`
      );
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.patch("/api/payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const partialSchema = insertPaymentSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const payment = await storage.updatePayment(id, validatedData);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      await logActivity(
        req,
        "UPDATE",
        "payment",
        payment.id,
        `Updated payment #${payment.id} - Status: ${payment.paymentStatus}`
      );
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Activity logs (Admin only)
  app.get("/api/activity-logs", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getRecentActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
