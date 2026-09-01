import { Request, Response } from "express";
import {
  scheduleEmail,
  getScheduledEmails,
  getSentEmails,
  getEmailById,
  cancelScheduledEmail,
} from "../services/email.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function createScheduledEmail(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const {
            recipient,
            subject,
            body,
            scheduledAt,
        } = req.body;



        if (!recipient || !subject || !body || !scheduledAt) {
            return res.status(400).json({
                success: false,
                message:
                    "recipient, subject, body and scheduledAt are required",
            });
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(recipient)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recipient email",
            });
        }

        if (subject.length > 255) {
            return res.status(400).json({
                success: false,
                message: "Subject must be 255 characters or less",
            });
        }

        if (body.length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Body must be 10,000 characters or less",
            });
        }


        const scheduledDate = new Date(scheduledAt);

        if (Number.isNaN(scheduledDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheduledAt",
            });
        }

        // Temporary user ID.
        // Authentication will replace this later.
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const userId = req.user.userId;

        const result = await scheduleEmail({
            userId,
            recipient,
            subject,
            body,
            scheduledAt: scheduledDate,
        });

        return res.status(201).json({
            success: true,
            message: "Email scheduled successfully",
            data: result,
        });
    } catch (error) {
        console.error("Schedule email error:", error);

        const message =
            error instanceof Error
                ? error.message
                : "Failed to schedule email";

        return res.status(500).json({
            success: false,
            message,
        });
    }
}

export async function getScheduled(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const result = await getScheduledEmails(
            req.user.userId
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get scheduled emails error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch scheduled emails",
        });
    }
}

export async function getSent(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const result = await getSentEmails(
            req.user.userId
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get sent emails error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch sent emails",
        });
    }
}

export async function getSingleEmail(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const emailId = Number(req.params.id);

        if (!Number.isInteger(emailId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email ID",
            });
        }

        const email = await getEmailById(
            req.user.userId,
            emailId
        );

        if (!email) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        return res.json({
            success: true,
            data: email,
        });
    } catch (error) {
        console.error("Get email error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch email",
        });
    }
}

export async function cancelEmail(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const emailId = Number(req.params.id);

    if (!Number.isInteger(emailId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email ID",
      });
    }

    const result = await cancelScheduledEmail(
      req.user.userId,
      emailId
    );

    return res.json({
      success: true,
      message: "Email cancelled successfully",
      data: result,
    });
  } catch (error) {
    console.error("Cancel email error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to cancel email";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}