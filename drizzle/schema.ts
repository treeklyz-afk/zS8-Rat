import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Payment Gateway Tables
export const paymentConfig = mysqlTable("payment_config", {
  id: int("id").autoincrement().primaryKey(),
  activeMethod: mysqlEnum("activeMethod", ["upi_intent", "phonepe_merchant", "static_qr"]).default("upi_intent").notNull(),
  upiId: varchar("upiId", { length: 255 }).default(""),
  merchantName: varchar("merchantName", { length: 255 }).default(""),
  phonepeMerchantId: varchar("phonepeMerchantId", { length: 255 }).default(""),
  staticQrUrl: text("staticQrUrl").default(""),
  staticQrStorageKey: varchar("staticQrStorageKey", { length: 255 }).default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentConfig = typeof paymentConfig.$inferSelect;
export type InsertPaymentConfig = typeof paymentConfig.$inferInsert;

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  referenceId: varchar("referenceId", { length: 64 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("INR").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["upi_intent", "phonepe_merchant", "static_qr"]).notNull(),
  status: mysqlEnum("status", ["initiated", "pending", "completed", "failed", "cancelled"]).default("initiated").notNull(),
  upiDeepLink: text("upiDeepLink").default(""),
  qrCodeUrl: text("qrCodeUrl").default(""),
  merchantName: varchar("merchantName", { length: 255 }).default(""),
  description: text("description").default(""),
  externalAppId: varchar("externalAppId", { length: 64 }).default(""),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const qrCodes = mysqlTable("qr_codes", {
  id: int("id").autoincrement().primaryKey(),
  storageKey: varchar("storageKey", { length: 255 }).notNull().unique(),
  url: text("url").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 64 }).default("image/png").notNull(),
  fileSize: int("fileSize").notNull(),
  uploadedBy: int("uploadedBy"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = typeof qrCodes.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["payment_initiated", "payment_completed", "payment_failed", "config_updated"]).notNull(),
  transactionId: int("transactionId"),
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;