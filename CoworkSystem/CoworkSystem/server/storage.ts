import {
  users,
  members,
  spaces,
  bookings,
  payments,
  activityLogs,
  type User,
  type UpsertUser,
  type Member,
  type InsertMember,
  type Space,
  type InsertSpace,
  type Booking,
  type InsertBooking,
  type Payment,
  type InsertPayment,
  type ActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Member operations
  getAllMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, data: Partial<InsertMember>): Promise<Member | undefined>;

  // Space operations
  getAllSpaces(): Promise<Space[]>;
  getSpace(id: number): Promise<Space | undefined>;
  createSpace(space: InsertSpace): Promise<Space>;
  updateSpace(id: number, data: Partial<InsertSpace>): Promise<Space | undefined>;

  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, data: Partial<InsertBooking>): Promise<Booking | undefined>;
  checkBookingConflict(
    spaceId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number
  ): Promise<boolean>;

  // Payment operations
  getAllPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment | undefined>;

  // Activity log operations
  createActivityLog(
    userId: string,
    action: string,
    entityType: string,
    entityId?: number,
    details?: string
  ): Promise<ActivityLog>;
  getRecentActivityLogs(limit?: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
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

  // Member operations
  async getAllMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(desc(members.createdAt));
  }

  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async createMember(memberData: InsertMember): Promise<Member> {
    const [member] = await db.insert(members).values(memberData).returning();
    return member;
  }

  async updateMember(id: number, data: Partial<InsertMember>): Promise<Member | undefined> {
    const [updated] = await db
      .update(members)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return updated;
  }

  // Space operations
  async getAllSpaces(): Promise<Space[]> {
    return await db.select().from(spaces).orderBy(desc(spaces.createdAt));
  }

  async getSpace(id: number): Promise<Space | undefined> {
    const [space] = await db.select().from(spaces).where(eq(spaces.id, id));
    return space;
  }

  async createSpace(spaceData: InsertSpace): Promise<Space> {
    const [space] = await db.insert(spaces).values(spaceData).returning();
    return space;
  }

  async updateSpace(id: number, data: Partial<InsertSpace>): Promise<Space | undefined> {
    const [updated] = await db
      .update(spaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(spaces.id, id))
      .returning();
    return updated;
  }

  // Booking operations
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async checkBookingConflict(
    spaceId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number
  ): Promise<boolean> {
    let query = db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.spaceId, spaceId),
          eq(bookings.status, "confirmed"),
          or(
            and(gte(bookings.startTime, startTime), lte(bookings.startTime, endTime)),
            and(gte(bookings.endTime, startTime), lte(bookings.endTime, endTime)),
            and(lte(bookings.startTime, startTime), gte(bookings.endTime, endTime))
          )
        )
      );

    if (excludeBookingId) {
      const results = await query;
      const conflicts = results.filter((b) => b.id !== excludeBookingId);
      return conflicts.length > 0;
    }

    const results = await query;
    return results.length > 0;
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  async updateBooking(id: number, data: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  // Payment operations
  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updated] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // Activity log operations
  async createActivityLog(
    userId: string,
    action: string,
    entityType: string,
    entityId?: number,
    details?: string
  ): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values({
        userId,
        action,
        entityType,
        entityId,
        details,
      })
      .returning();
    return log;
  }

  async getRecentActivityLogs(limit = 50): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
