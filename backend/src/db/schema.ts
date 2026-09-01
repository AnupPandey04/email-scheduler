import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emails = mysqlTable(
  "emails",
  {
    id: int("id").autoincrement().primaryKey(),

    userId: int("user_id").notNull(),

    recipient: varchar("recipient", { length: 255 }).notNull(),

    subject: varchar("subject", { length: 500 }).notNull(),

    body: text("body").notNull(),

    scheduledAt: timestamp("scheduled_at").notNull(),

    status: mysqlEnum("status", [
      "SCHEDULED",
      "PROCESSING",
      "SENT",
      "FAILED",
      "CANCELLED",
    ])
      .default("SCHEDULED")
      .notNull(),

    jobId: varchar("job_id", { length: 255 }),

    sentAt: timestamp("sent_at"),

    errorMessage: text("error_message"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("emails_user_id_idx").on(table.userId),
    statusIdx: index("emails_status_idx").on(table.status),
    scheduledAtIdx: index("emails_scheduled_at_idx").on(
      table.scheduledAt
    ),
  })
);

export const emailLogs = mysqlTable(
  "email_logs",
  {
    id: int("id").autoincrement().primaryKey(),

    emailId: int("email_id").notNull(),

    event: varchar("event", { length: 50 }).notNull(),

    message: text("message"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdIdx: index("email_logs_email_id_idx").on(
      table.emailId
    ),
  })
);

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  emails: many(emails),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
  user: one(users, {
    fields: [emails.userId],
    references: [users.id],
  }),
  logs: many(emailLogs),
}));

export const emailLogsRelations = relations(
  emailLogs,
  ({ one }) => ({
    email: one(emails, {
      fields: [emailLogs.emailId],
      references: [emails.id],
    }),
  })
);