import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profile table
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  age: integer("age"),
  gender: text("gender"),
  address: text("address"),
  biography: text("biography"),
  hobbies: text("hobbies"),
  skills: text("skills"),
  goals: text("goals"),
  notes: text("notes"),
  profilePicture: text("profile_picture"),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Social Links table
export const socialLinks = pgTable("social_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

// Vault Credentials table
export const vaultCredentials = pgTable("vault_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteName: text("site_name").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  url: text("url"),
  notes: text("notes"),
});

export const insertVaultCredentialSchema = createInsertSchema(vaultCredentials).omit({
  id: true,
});

export type InsertVaultCredential = z.infer<typeof insertVaultCredentialSchema>;
export type VaultCredential = typeof vaultCredentials.$inferSelect;

// Vault settings (for PIN)
export const vaultSettings = pgTable("vault_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pin: text("pin").notNull(),
});

export const insertVaultSettingSchema = createInsertSchema(vaultSettings).omit({
  id: true,
});

export type InsertVaultSetting = z.infer<typeof insertVaultSettingSchema>;
export type VaultSetting = typeof vaultSettings.$inferSelect;
