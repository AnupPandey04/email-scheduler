import {
  and,
  desc,
  eq,
} from "drizzle-orm";
import { db } from "../db/index.js";
import { emails, emailLogs } from "../db/schema.js";
import { emailQueue } from "../queues/email.queue.js";

interface ScheduleEmailInput {
  userId: number;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
}

export async function scheduleEmail({
  userId,
  recipient,
  subject,
  body,
  scheduledAt,
}: ScheduleEmailInput) {
  const now = new Date();

  if (scheduledAt <= now) {
    throw new Error("Scheduled time must be in the future");
  }

  // Create the database record first.
  const result = await db.insert(emails).values({
    userId,
    recipient,
    subject,
    body,
    scheduledAt,
    status: "SCHEDULED",
  });

  const emailId = Number(result[0].insertId);

  // Calculate BullMQ delay.
  const delay = scheduledAt.getTime() - now.getTime();

  // Create the delayed job.
  const job = await emailQueue.add(
    "send-email",
    {
      emailId,
    },
    {
      jobId: `email-${emailId}`,
      delay,
    }
  );

  // Store the BullMQ job ID.
  await db
    .update(emails)
    .set({
      jobId: job.id,
      updatedAt: new Date(),
    })
    .where(eq(emails.id, emailId));

  // Create audit log.
  await db.insert(emailLogs).values({
    emailId,
    event: "SCHEDULED",
    message: "Email scheduled successfully",
  });

  return {
    emailId,
    jobId: job.id,
    scheduledAt,
  };
}

export async function getScheduledEmails(userId: number) {
  return db
    .select()
    .from(emails)
    .where(
      and(
        eq(emails.userId, userId),
        eq(emails.status, "SCHEDULED")
      )
    )
    .orderBy(emails.scheduledAt);
}

export async function getSentEmails(userId: number) {
  return db
    .select()
    .from(emails)
    .where(
      and(
        eq(emails.userId, userId),
        eq(emails.status, "SENT")
      )
    )
    .orderBy(desc(emails.sentAt));
}

export async function getAllEmails(userId: number) {
  return db
    .select()
    .from(emails)
    .where(eq(emails.userId, userId))
    .orderBy(desc(emails.updatedAt));
}

export async function getEmailById(
  userId: number,
  emailId: number
) {
  const result = await db
    .select()
    .from(emails)
    .where(
      and(
        eq(emails.id, emailId),
        eq(emails.userId, userId)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

export async function cancelScheduledEmail(
  userId: number,
  emailId: number
) {
  const result = await db
    .select()
    .from(emails)
    .where(
      and(
        eq(emails.id, emailId),
        eq(emails.userId, userId)
      )
    )
    .limit(1);

  const email = result[0];

  if (!email) {
    throw new Error("Email not found");
  }

  if (email.status !== "SCHEDULED") {
    throw new Error(
      `Email cannot be cancelled because its status is ${email.status}`
    );
  }

  if (email.jobId) {
    const job = await emailQueue.getJob(email.jobId);

    if (job) {
      await job.remove();
    }
  }

  await db
    .update(emails)
    .set({
      status: "CANCELLED",
      updatedAt: new Date(),
    })
    .where(eq(emails.id, emailId));

  await db.insert(emailLogs).values({
    emailId,
    event: "CANCELLED",
    message: "Scheduled email cancelled by user",
  });

  return {
    emailId,
    status: "CANCELLED",
  };
}

