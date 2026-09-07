import { Router } from "express";
import { z } from "zod";
import { auditLog, requireAuth, requireRole, validate } from "../middleware.js";
import { createMedicine, listMedicines } from "../repos/medicineRepo.js";
import { paginatedMeta, parsePagination } from "../paginate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { dispenseAndBill } from "../services/pharmacyService.js";

const router = Router();
router.use(requireAuth);
router.use(auditLog);

const batchSchema = z.object({
  brandName: z.string().min(2).max(80),
  genericName: z.string().min(2).max(80),
  category: z.string().min(2).max(40),
  batchNo: z.string().min(2).max(30),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "expiryDate must be YYYY-MM-DD")
    .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), {
      message: "expiryDate must be a real calendar date",
    }),
  unitPrice: z.number().positive(),
  stockCount: z.number().int().min(1),
  minThreshold: z.number().int().min(1),
});

const dispenseSchema = z.object({
  medicineId: z.string().min(1),
  qty: z.number().int().min(1).max(1000),
  patientId: z.string().min(1),
});

// GET /api/pharmacy?search=&lowStock=true&page=&limit= — FEFO sorted
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search = "", lowStock = "" } = req.query as Record<string, string>;
    const pagination = parsePagination(req.query as Record<string, string>);
    const { data, total } = await listMedicines({ search, lowStock }, pagination);
    res.json({ data, meta: paginatedMeta(total, pagination) });
  }),
);

// POST /api/pharmacy/batches
router.post(
  "/batches",
  requireRole("Admin", "Pharmacist"),
  validate(batchSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof batchSchema>;
    const med = await createMedicine(body);
    res.status(201).json({ data: med });
  }),
);

// POST /api/pharmacy/dispense — validates, decrements stock, posts charge to billing.
// Business logic is in pharmacyService — the route just validates + delegates.
router.post(
  "/dispense",
  requireRole("Admin", "Pharmacist"),
  validate(dispenseSchema),
  asyncHandler(async (req, res, next) => {
    const { medicineId, qty, patientId } = req.body as z.infer<typeof dispenseSchema>;
    try {
      const result = await dispenseAndBill(medicineId, qty, patientId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }),
);

export default router;
