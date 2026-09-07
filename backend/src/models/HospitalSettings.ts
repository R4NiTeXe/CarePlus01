import mongoose, { Schema } from "mongoose";

// Singleton hospital profile (key: "hospital"). One row drives the landing
// page, the booking slot picker, and support contacts on every device.
const hospitalSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    hospitalName: { type: String, required: true, maxlength: 120 },
    contactPhone: { type: String, default: "" },
    contactPhoneHref: { type: String, default: "" },
    address: { type: String, default: "" },
    opdHoursNote: { type: String, default: "" },
    slotMinutes: { type: Number, required: true, enum: [10, 15, 20, 30, 60] },
  },
  { timestamps: true },
);

export const HospitalSettingsModel = mongoose.model("HospitalSettings", hospitalSettingsSchema);
