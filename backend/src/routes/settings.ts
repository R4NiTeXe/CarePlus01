import { Router } from "express";
import { z } from "zod";
import { ApiError } from "../errors.js";
import { auditLog, requireAuth, requireRole, validate } from "../middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isDbReady } from "../db.js";
import { getSettings, updateSettings } from "../repos/settingsRepo.js";

const router = Router();
router.use(requireAuth);
router.use(auditLog);

// GET /api/settings — hospital profile for signed-in staff
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ data: await getSettings() });
  }),
);

const updateSchema = z.object({
  hospitalName: z.string().min(2).max(120).optional(),
  contactPhone: z.string().max(40).optional(),
  contactPhoneHref: z
    .string()
    .max(30)
    .regex(/^[+\d]*$/, "digits and leading + only")
    .optional(),
  address: z.string().max(200).optional(),
  opdHoursNote: z.string().max(200).optional(),
  slotMinutes: z.coerce
    .number()
    .refine((v) => [10, 15, 20, 30, 60].includes(v), "slot must be 10, 15, 20, 30 or 60")
    .optional(),
});

// PUT /api/settings — Admin only; propagates to every device and the landing page
router.put(
  "/",
  requireRole("Admin"),
  validate(updateSchema),
  asyncHandler(async (req, res, next) => {
    if (!isDbReady()) {
      next(ApiError.unavailable("Settings unavailable — database not connected"));
      return;
    }
    const updated = await updateSettings(req.body as Parameters<typeof updateSettings>[0]);
    res.json({ data: updated });
  }),
);

export default router;
