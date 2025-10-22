import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table - Required for Replit Auth with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "staff"] }).notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
}));

// Members table - Coworking space members
export const members = pgTable("members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).notNull(),
  membershipType: varchar("membership_type", { 
    enum: ["daily", "weekly", "monthly", "annual"] 
  }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  joinedDate: timestamp("joined_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const membersRelations = relations(members, ({ many }) => ({
  bookings: many(bookings),
}));

// Spaces table - Available coworking spaces
export const spaces = pgTable("spaces", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { 
    enum: ["desk", "private_office", "meeting_room", "conference_room"] 
  }).notNull(),
  capacity: integer("capacity").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { 
    enum: ["available", "occupied", "maintenance"] 
  }).notNull().default("available"),
  description: text("description"),
  amenities: text("amenities").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spacesRelations = relations(spaces, ({ many }) => ({
  bookings: many(bookings),
}));

// Bookings table - Space reservations
export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  memberId: integer("member_id").notNull().references(() => members.id),
  spaceId: integer("space_id").notNull().references(() => spaces.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  bookingType: varchar("booking_type", { enum: ["hourly", "daily"] }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { 
    enum: ["confirmed", "cancelled", "completed"] 
  }).notNull().default("confirmed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  member: one(members, {
    fields: [bookings.memberId],
    references: [members.id],
  }),
  space: one(spaces, {
    fields: [bookings.spaceId],
    references: [spaces.id],
  }),
  payments: many(payments),
}));

// Payments table - Payment records
export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { 
    enum: ["cash", "credit_card", "debit_card", "bank_transfer"] 
  }).notNull(),
  paymentStatus: varchar("payment_status", { 
    enum: ["paid", "pending", "overdue", "refunded"] 
  }).notNull().default("pending"),
  paymentDate: timestamp("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

// Activity Logs table - Audit trail
export const activityLogs = pgTable("activity_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Type exports for Replit Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Insert schemas with validation
export const insertMemberSchema = createInsertSchema(members, {
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  membershipType: z.enum(["daily", "weekly", "monthly", "annual"]),
}).omit({ id: true, createdAt: true, updatedAt: true, joinedDate: true });

export const insertSpaceSchema = createInsertSchema(spaces, {
  name: z.string().min(2, "Space name must be at least 2 characters"),
  type: z.enum(["desk", "private_office", "meeting_room", "conference_room"]),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  hourlyRate: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Hourly rate must be a positive number",
  }),
  dailyRate: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Daily rate must be a positive number",
  }),
  status: z.enum(["available", "occupied", "maintenance"]),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertBookingSchema = createInsertSchema(bookings, {
  memberId: z.number().int().positive("Member ID is required"),
  spaceId: z.number().int().positive("Space ID is required"),
  startTime: z.date(),
  endTime: z.date(),
  bookingType: z.enum(["hourly", "daily"]),
  totalAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Total amount must be a positive number",
  }),
  status: z.enum(["confirmed", "cancelled", "completed"]),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPaymentSchema = createInsertSchema(payments, {
  bookingId: z.number().int().positive("Booking ID is required"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  paymentMethod: z.enum(["cash", "credit_card", "debit_card", "bank_transfer"]),
  paymentStatus: z.enum(["paid", "pending", "overdue", "refunded"]),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Select types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type Space = typeof spaces.$inferSelect;
export type InsertSpace = z.infer<typeof insertSpaceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
