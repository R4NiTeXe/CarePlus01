import { HospitalSettingsModel } from "../models/HospitalSettings.js";
import { isDbReady } from "../db.js";

export interface HospitalSettings {
  hospitalName: string;
  contactPhone: string;
  contactPhoneHref: string;
  address: string;
  opdHoursNote: string;
  slotMinutes: 10 | 15 | 20 | 30 | 60;
}

export const DEFAULT_SETTINGS: HospitalSettings = {
  hospitalName: "CarePlus Multi-Speciality Hospital",
  contactPhone: "",
  contactPhoneHref: "",
  address: "",
  opdHoursNote: "OPD Mon–Sat, 9 AM – 5 PM • Emergency wing never closes",
  slotMinutes: 30,
};

function sanitize(doc: unknown): HospitalSettings {
  const d = (doc ?? {}) as Partial<HospitalSettings>;
  return {
    hospitalName:
      typeof d.hospitalName === "string" && d.hospitalName.trim()
        ? d.hospitalName
        : DEFAULT_SETTINGS.hospitalName,
    contactPhone: typeof d.contactPhone === "string" ? d.contactPhone : "",
    contactPhoneHref: typeof d.contactPhoneHref === "string" ? d.contactPhoneHref : "",
    address: typeof d.address === "string" ? d.address : "",
    opdHoursNote:
      typeof d.opdHoursNote === "string" && d.opdHoursNote.trim()
        ? d.opdHoursNote
        : DEFAULT_SETTINGS.opdHoursNote,
    slotMinutes: ([10, 15, 20, 30, 60] as number[]).includes(d.slotMinutes as number)
      ? (d.slotMinutes as HospitalSettings["slotMinutes"])
      : DEFAULT_SETTINGS.slotMinutes,
  };
}

export async function getSettings(): Promise<HospitalSettings> {
  if (!isDbReady()) return DEFAULT_SETTINGS;
  const doc = await HospitalSettingsModel.findOne({ key: "hospital" }).lean();
  return sanitize(doc);
}

export async function updateSettings(patch: Partial<HospitalSettings>): Promise<HospitalSettings> {
  const doc = await HospitalSettingsModel.findOneAndUpdate(
    { key: "hospital" },
    { $set: { ...patch, key: "hospital" } },
    { new: true, upsert: true },
  ).lean();
  return sanitize(doc);
}
