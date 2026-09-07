/**
 * Pharmacy service — encapsulates the dispense + billing workflow.
 *
 * Routes should delegate to this service instead of containing
 * business logic inline. Pattern: Routes → Services → Repos → Models.
 */
import { ApiError } from "../errors.js";
import { getMedicineById, dispenseMedicine } from "../repos/medicineRepo.js";
import { getPatientById } from "../repos/patientRepo.js";
import { appendInvoiceItem, createInvoice, findOpenInvoice } from "../repos/invoiceRepo.js";
import { billTotals } from "../utils/money.js";

export interface DispenseResult {
  medicine: Awaited<ReturnType<typeof getMedicineById>>;
  dispensedQty: number;
  charge: number;
  patientId: string;
  billId: string | null;
}

/**
 * Validates, decrements stock, and posts the pharmacy charge to billing.
 *
 * Throws an ApiError for any business-rule violation so the route handler
 * stays thin: validate input → call service → return response.
 */
export async function dispenseAndBill(
  medicineId: string,
  qty: number,
  patientId: string,
): Promise<DispenseResult> {
  const med = await getMedicineById(medicineId);
  if (!med) throw ApiError.notFound("Medicine");

  // Block by actual date too — status alone can lag behind the calendar.
  const today = new Date().toISOString().slice(0, 10);
  const expiredByDate = new Date(med.expiryDate as unknown as string | Date) < new Date(today);
  if (med.status === "Expired" || expiredByDate) {
    throw ApiError.conflict("Cannot dispense an expired batch");
  }

  if (med.stockCount < qty) {
    throw ApiError.conflict(`Only ${med.stockCount} units in stock`);
  }

  const patient = await getPatientById(patientId);
  if (!patient) throw ApiError.notFound("Patient");

  const updated = await dispenseMedicine(medicineId, qty);
  if (!updated) {
    // Lost a concurrent race after the pre-check — atomic guard refused.
    throw ApiError.conflict("Insufficient stock");
  }

  const charge = med.unitPrice * qty;
  const lineItem = {
    desc: `${med.brandName} x${qty}`,
    dept: "Pharmacy" as const,
    amount: charge,
  };

  // Append to the patient's open unpaid bill; open a fresh one if none exists.
  const openBill = await findOpenInvoice(patientId);
  const bill = openBill
    ? await appendInvoiceItem(openBill.id, lineItem)
    : await createInvoice({
        patientId,
        patientName: patient.fullName,
        items: [lineItem],
        ...billTotals([lineItem], 0),
        paymentMethod: "Cash",
      });

  return {
    medicine: updated,
    dispensedQty: qty,
    charge,
    patientId,
    billId: bill?.id ?? null,
  };
}
