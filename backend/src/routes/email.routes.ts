import { Router } from "express";

import {
  createScheduledEmail,
  getScheduled,
  getSent,
  getAll,
  getSingleEmail,
  cancelEmail,
} from "../controllers/email.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", createScheduledEmail);

router.get("/scheduled", getScheduled);

router.get("/sent", getSent);

router.get("/all", getAll);

router.get("/:id", getSingleEmail);

router.delete("/:id", cancelEmail);

export default router;