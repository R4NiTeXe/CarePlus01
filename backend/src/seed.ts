import { connectDB, disconnectDB } from "./db.js";
import { db } from "./store.js";
import { PatientModel } from "./models/Patient.js";
import { AppointmentModel } from "./models/Appointment.js";
import { BedModel } from "./models/Bed.js";
import { MedicineModel } from "./models/Medicine.js";
import { LabModel } from "./models/LabReport.js";
import { InvoiceModel } from "./models/Invoice.js";
import { DoctorModel } from "./models/Doctor.js";
import { DepartmentModel } from "./models/Department.js";
import { InventoryModel } from "./models/Inventory.js";
import { StaffModel } from "./models/Staff.js";
import { AuditModel } from "./models/Audit.js";
import { UserModel } from "./models/User.js";
import { HospitalSettingsModel } from "./models/HospitalSettings.js";
import { SessionModel } from "./models/Session.js";
import { CounterModel } from "./models/Counter.js";
import { hashPassword } from "./repos/userRepo.js";
import { ID_SPECS, invoiceSpec, syncCounter } from "./repos/counterRepo.js";

async function upsertAll<T extends { id: string }>(
  model: {
    bulkWrite: (ops: never, opts?: never) => Promise<unknown>;
    countDocuments: () => Promise<number>;
  },
  docs: T[],
  label: string,
): Promise<void> {
  if (docs.length === 0) {
    console.log(`${label}: 0 docs`);
    return;
  }
  const before = await model.countDocuments();
  const ops = docs.map((doc) => ({
    updateOne: { filter: { id: doc.id }, update: { $set: doc }, upsert: true },
  }));
  const res = await model.bulkWrite(ops as never, { ordered: false } as never);
  const after = await model.countDocuments();
  const inserted = after - before;
  const matched = docs.length - inserted;
  void res;
  console.log(`${label}: ${inserted} inserted, ${matched} already present`);
}

const day = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

async function wipeDatabase(): Promise<void> {
  // Explicit allowlist — only CarePlus collections, never anything else.
  const models: Array<{ deleteMany: (filter: object) => Promise<unknown> }> = [
    PatientModel,
    AppointmentModel,
    BedModel,
    MedicineModel,
    LabModel,
    InvoiceModel,
    DoctorModel,
    DepartmentModel,
    InventoryModel,
    StaffModel,
    AuditModel,
    UserModel,
    SessionModel,
    CounterModel,
    HospitalSettingsModel,
  ];
  for (const m of models) {
    await m.deleteMany({});
  }
  console.log("database wiped (CarePlus collections only)");
}

async function main(): Promise<void> {
  await connectDB();
  if (process.env.SEED_WIPE === "true") {
    await wipeDatabase();
  }
  console.log("seeding careplus database...");

  // Demo dates stay fresh: appointments today, reports/bills yesterday,
  // admissions a few days back — no matter when seeding runs.
  const appointments = db.appointments.map((a) => ({ ...a, date: day(0) }));
  const labs = db.labs.map((l) => ({ ...l, orderDate: day(-1) }));
  const invoices = db.invoices.map((i) => ({ ...i, date: day(-1) }));
  const beds = db.beds.map((b) => (b.admittedDate ? { ...b, admittedDate: day(-3) } : b));

  await upsertAll(PatientModel, db.patients, "patients");
  await upsertAll(AppointmentModel, appointments, "appointments");
  await upsertAll(BedModel, beds, "beds");
  await upsertAll(MedicineModel, db.medicines, "medicines");
  await upsertAll(LabModel, labs, "lab reports");
  await upsertAll(InvoiceModel, invoices, "invoices");
  await upsertAll(DoctorModel, db.doctors, "doctors");
  await upsertAll(DepartmentModel, db.departments, "departments");
  await upsertAll(InventoryModel, db.inventory, "inventory");
  await upsertAll(StaffModel, db.staff, "staff");
  await upsertAll(
    AuditModel,
    db.auditLogs.map((a) => ({ ...a, timestamp: new Date(a.timestamp) })),
    "audit logs",
  );

  await syncCounter(
    ID_SPECS.patient,
    db.patients.map((p) => p.id),
  );
  await syncCounter(
    ID_SPECS.appointment,
    db.appointments.map((a) => a.id),
  );
  await syncCounter(
    invoiceSpec(),
    db.invoices.map((i) => i.id),
  );
  await syncCounter(
    ID_SPECS.medicine,
    db.medicines.map((m) => m.id),
  );
  await syncCounter(
    ID_SPECS.lab,
    db.labs.map((l) => l.id),
  );
  console.log("counters synced");

  // Demo staff logins (project demo only) — created once, skipped when present
  // so real passwords are never overwritten. Frictionless sign-in (no forced
  // change) so an interviewer can explore every desk immediately; the
  // forced-change flow stays demoable via Team → Temp password.
  const demoStaff = [
    {
      email: "doctor@careplus.local",
      name: "Dr. Amit Verma",
      role: "Doctor",
      password: "Doctor@123",
    },
    { email: "nurse@careplus.local", name: "Nurse Asha", role: "Nurse", password: "Nurse@123" },
    {
      email: "pharma@careplus.local",
      name: "Ravi Kumar",
      role: "Pharmacist",
      password: "Pharma@123",
    },
    { email: "lab@careplus.local", name: "Anjali Rao", role: "LabTech", password: "Lab@1234" },
    {
      email: "cashier@careplus.local",
      name: "Meena Iyer",
      role: "Cashier",
      password: "Cashier@123",
    },
  ] as const;
  for (const s of demoStaff) {
    const present = await UserModel.findOne({ email: s.email }).lean();
    if (!present) {
      await UserModel.create({
        email: s.email,
        name: s.name,
        passwordHash: await hashPassword(s.password),
        role: s.role,
        isActive: true,
        mustChangePassword: false,
        securityQuestion: "What city were you born in?",
        securityAnswerHash: await hashPassword(`careplus-${s.role.toLowerCase()}`),
      });
      console.log(`demo staff created: ${s.email} / ${s.password}`);
    }
  }

  // Hospital profile singleton — landing page, slot picker, support contacts
  await HospitalSettingsModel.updateOne(
    { key: "hospital" },
    {
      $setOnInsert: {
        key: "hospital",
        hospitalName: "CarePlus Multi-Speciality Hospital",
        contactPhone: "+91 98765 43210",
        contactPhoneHref: "919876543210",
        address: "12 MG Road, Medical District",
        opdHoursNote: "OPD Mon–Sat, 9 AM – 5 PM • Emergency wing never closes",
        slotMinutes: 30,
      },
    },
    { upsert: true },
  );
  console.log("hospital settings ensured");

  // Default admin (dev only) — change password immediately in real deployments
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@careplus.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
  const existing = await UserModel.findOne({ email: adminEmail }).lean();
  if (!existing) {
    await UserModel.create({
      email: adminEmail,
      name: "Hospital Administrator",
      passwordHash: await hashPassword(adminPassword),
      role: "Admin",
      isActive: true,
      mustChangePassword: false,
      securityQuestion: "What is the hospital emergency helpline number?",
      securityAnswerHash: await hashPassword("9877654320"),
    });
    console.log(`admin user created: ${adminEmail}`);
  } else {
    // Backfill security Q&A for admins seeded before the recovery feature
    const legacy = existing as unknown as Record<string, unknown>;
    if (!legacy["securityQuestion"]) {
      await UserModel.updateOne(
        { email: adminEmail },
        {
          securityQuestion: "What is the hospital emergency helpline number?",
          securityAnswerHash: await hashPassword("9877654320"),
          mustChangePassword: false,
        },
      );
      console.log(`admin user backfilled with recovery question: ${adminEmail}`);
    } else {
      console.log(`admin user already present: ${adminEmail}`);
    }
  }

  console.log("seed complete");
  await disconnectDB();
  process.exit(0);
}

main().catch(async (err: unknown) => {
  console.error("seed failed:", err);
  try {
    await disconnectDB();
  } catch {
    // ignore disconnect error during failure path
  }
  process.exit(1);
});
