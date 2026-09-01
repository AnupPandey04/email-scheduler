import http from "node:http";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { redisConnection } from "../config/redis.js";
import { sendEmail } from "../services/mail.service.js";
import { db } from "../db/index.js";
import { emails, emailLogs } from "../db/schema.js";

const worker = new Worker(
  "email-scheduler",
  async (job) => {
    const { emailId } = job.data;

    console.log(
      `Processing email ${emailId}, job ${job.id}`
    );

    // Retrieve the authoritative email record.
    const records = await db
      .select()
      .from(emails)
      .where(eq(emails.id, Number(emailId)))
      .limit(1);

    const email = records[0];

    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    // Idempotency protection.
    if (email.status === "SENT") {
      console.log(
        `Email ${emailId} already sent. Skipping.`
      );

      return {
        skipped: true,
        reason: "Email already sent",
      };
    }

    // Mark as processing.
    await db
      .update(emails)
      .set({
        status: "PROCESSING",
        updatedAt: new Date(),
      })
      .where(eq(emails.id, email.id));

    await db.insert(emailLogs).values({
      emailId: email.id,
      event: "PROCESSING",
      message: "Worker started processing email",
    });

    try {
      const result = await sendEmail({
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
      });

      await db
        .update(emails)
        .set({
          status: "SENT",
          sentAt: new Date(),
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(emails.id, email.id));

      await db.insert(emailLogs).values({
        emailId: email.id,
        event: "SENT",
        message: `Email sent successfully. Message ID: ${result.messageId}`,
      });

      console.log(`Email ${email.id} sent successfully`);

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown email sending error";

      const isLastAttempt =
        job.attemptsMade + 1 >=
        (job.opts.attempts ?? 1);

      if (isLastAttempt) {
        await db
          .update(emails)
          .set({
            status: "FAILED",
            errorMessage: message,
            updatedAt: new Date(),
          })
          .where(eq(emails.id, email.id));

        await db.insert(emailLogs).values({
          emailId: email.id,
          event: "FAILED",
          message: `Final attempt failed: ${message}`,
        });
      } else {
        await db
          .update(emails)
          .set({
            status: "SCHEDULED",
            errorMessage: message,
            updatedAt: new Date(),
          })
          .where(eq(emails.id, email.id));

        await db.insert(emailLogs).values({
          emailId: email.id,
          event: "RETRY",
          message: `Attempt failed. Retrying: ${message}`,
        });
      }

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

worker.on("completed", (job, result) => {
  console.log(`Worker completed job ${job.id}`);
  console.log("Result:", result);
});

worker.on("failed", (job, error) => {
  console.error(
    `Worker failed job ${job?.id}:`,
    error.message
  );
});

console.log("Email worker started...");

const PORT = Number(process.env.PORT) || 10000;
const HOST = "0.0.0.0";

http
  .createServer((_req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });

    res.end("Email worker is running");
  })
  .listen(PORT, HOST, () => {
    console.log(
      `Worker health server running on ${HOST}:${PORT}`
    );
  });