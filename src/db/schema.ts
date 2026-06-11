import {
  boolean,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);
export const groupMemberRoleEnum = pgEnum("group_member_role", [
  "owner",
  "admin",
  "member",
]);
export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "completed",
  "auto_closed",
  "cancelled",
  "needs_review",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: citext("username").notNull(),
    email: citext("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    role: userRoleEnum("role").notNull().default("member"),
    isActive: boolean("is_active").notNull().default(true),
    passwordChangedAt: timestamp("password_changed_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_unique").on(table.username),
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex("password_reset_tokens_token_hash_unique").on(
      table.tokenHash,
    ),
  }),
);

export const studyGroups = pgTable("study_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => studyGroups.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: groupMemberRoleEnum("role").notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  checkinAt: timestamp("checkin_at", { withTimezone: true }).notNull(),
  checkoutAt: timestamp("checkout_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds"),
  status: sessionStatusEnum("status").notNull().default("active"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const studyEvents = pgTable("study_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: uuid("session_id").references(() => studySessions.id, {
    onDelete: "set null",
  }),
  groupId: uuid("group_id").references(() => studyGroups.id, {
    onDelete: "set null",
  }),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const studySessionEdits = pgTable("study_session_edits", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => studySessions.id, { onDelete: "cascade" }),
  editedByUserId: uuid("edited_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  oldCheckinAt: timestamp("old_checkin_at", { withTimezone: true }),
  oldCheckoutAt: timestamp("old_checkout_at", { withTimezone: true }),
  oldDurationSeconds: integer("old_duration_seconds"),
  oldStatus: text("old_status"),
  newCheckinAt: timestamp("new_checkin_at", { withTimezone: true }),
  newCheckoutAt: timestamp("new_checkout_at", { withTimezone: true }),
  newDurationSeconds: integer("new_duration_seconds"),
  newStatus: text("new_status"),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;
export type StudySession = typeof studySessions.$inferSelect;
export type GroupMemberRole = (typeof groupMemberRoleEnum.enumValues)[number];
export type SessionStatus = (typeof sessionStatusEnum.enumValues)[number];
