import { Router } from "express";
import { requireAuth, requireRole } from "../middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDashboardStats } from "../repos/dashboardRepo.js";

const router = Router();
router.use(requireAuth);
// Dashboard stats contain hospital-wide revenue, bed counts, and patient
// figures — restricted to Admin to match the RBAC matrix in the frontend.
router.use(requireRole("Admin"));

// GET /api/dashboard/stats — one call for the overview screen
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const data = await getDashboardStats();
    res.json({ data });
  }),
);

export default router;
