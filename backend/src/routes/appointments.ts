import { Router } from "express";
import { z } from "zod";
import { ApiError } from "../errors.js";
import { auditLog, requireAuth, requireRole, validate } from "../middleware.js";
import {
  createAppointment,
  getAppointmentById,
  hasActiveAppointment,
  hasPatientConflict,
  listAppointments,
  updateAppointmentStatus,
} from "../repos/appointmentRepo.js";
import { getPatientById } from "../repos/patientRepo.js";
import { paginatedMeta, parsePagination } from "../paginate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);
router.use(auditLog);

const vitalsSchema = z.object({
  bp: z.string().min(3).max(12),
  pulse: z.number().int().min(30).max(220),
  spo2: z.number().min(50).max(100),
  temp: z.number().min(90).max(110),
});

const createSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  doctorName: z.string().min(2),
  department: z.string().min(2),
  // Enforce ISO 8601 date — prevents "tomorrow", "ASAP", or past-date storage.
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
    .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), {
      message: "date must be a real calendar date",
    }),
  timeSlot: z.string().min(1),
  priority: z.enum(["Routine", "Urgent", "Emergency"]).default("Routine"),
  reason: z.string().min(3).max(300),
});

const statusSchema = z.object({
  status: z.enum(["Waiting", "In Triage", "With Doctor", "Completed", "Cancelled"]),
  vitals: vitalsSchema.optional(),
});

const TRANSITIONS: Record<string, string[]> = {
  // Doctors may pull straight from the waiting queue (direct consult) or
  // receive patients via triage — both are legitimate clinical flows.
  Waiting: ["In Triage", "With Doctor", "Cancelled"],
  "In Triage": ["With Doctor", "Cancelled"],
  "With Doctor": ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

// GET /api/appointments?status=&department=&priority=&search=&page=&limit=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      status = "",
      department = "",
      priority = "",
      search = "",
    } = req.query as Record<string, string>;
    const pagination = parsePagination(req.query as Record<string, string>);
    const { data, total } = await listAppointments(
      { status, department, priority, search },
      pagination,
    );
    res.json({ data, meta: paginatedMeta(total, pagination) });
  }),
);

// POST /api/appointments
router.post(
  "/",
  requireRole("Admin", "Nurse"),
  validate(createSchema),
  asyncHandler(async (req, res, next) => {
    const body = req.body as z.infer<typeof createSchema>;
    const patient = await getPatientById(body.patientId);
    if (!patient) {
      next(ApiError.notFound("Patient"));
      return;
    }
    if (await hasActiveAppointment(body.doctorId, body.date, body.timeSlot)) {
      next(
        ApiError.conflict(
          `${body.doctorName} is already booked at ${body.timeSlot} on ${body.date}`,
        ),
      );
      return;
    }
    // A patient cannot physically be in two places at the same time.
    if (await hasPatientConflict(body.patientId, body.date, body.timeSlot)) {
      next(
        ApiError.conflict(
          `${patient.fullName} already has an active appointment at ${body.timeSlot} on ${body.date}`,
        ),
      );
      return;
    }
    const appt = await createAppointment({
      ...body,
      patientName: patient.fullName,
    });
    res.status(201).json({ data: appt });
  }),
);

// PATCH /api/appointments/:id/status — guarded state machine
router.patch(
  "/:id/status",
  requireRole("Admin", "Doctor", "Nurse"),
  validate(statusSchema),
  asyncHandler(async (req, res, next) => {
    const appt = await getAppointmentById(req.params.id);
    if (!appt) {
      next(ApiError.notFound("Appointment"));
      return;
    }
    const { status, vitals } = req.body as z.infer<typeof statusSchema>;
    const allowed = TRANSITIONS[appt.status] ?? [];
    // Same-status updates are idempotent (e.g. attaching vitals to a patient
    // already in triage) — only genuine jumps are rejected.
    if (status !== appt.status && !allowed.includes(status)) {
      next(ApiError.conflict(`Cannot move ${appt.status} → ${status}`));
      return;
    }
    const updated = await updateAppointmentStatus(req.params.id, status, vitals);
    res.json({ data: updated });
  }),
);

export default router;
