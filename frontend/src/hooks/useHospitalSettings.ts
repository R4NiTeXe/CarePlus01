"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

export interface HospitalSettings {
  hospitalName: string;
  slotMinutes: 10 | 15 | 20 | 30 | 60;
  // Optional public contact details shown on the landing page.
  // Empty = hidden, so no placeholder phone/address is ever displayed.
  contactPhone: string;
  contactPhoneHref: string;
  address: string;
  opdHoursNote: string;
}

const STORAGE_KEY = "careplus_hospital_settings";

const DEFAULTS: HospitalSettings = {
  hospitalName: "CarePlus Multi-Speciality Hospital",
  slotMinutes: 30,
  contactPhone: "",
  contactPhoneHref: "",
  address: "",
  opdHoursNote: "OPD Mon–Sat, 9 AM – 5 PM • Emergency wing never closes",
};

function load(): HospitalSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<HospitalSettings>;
    return {
      hospitalName:
        typeof parsed.hospitalName === "string" && parsed.hospitalName.trim().length > 0
          ? parsed.hospitalName
          : DEFAULTS.hospitalName,
      slotMinutes: [10, 15, 20, 30, 60].includes(parsed.slotMinutes as number)
        ? (parsed.slotMinutes as HospitalSettings["slotMinutes"])
        : DEFAULTS.slotMinutes,
      contactPhone: typeof parsed.contactPhone === "string" ? parsed.contactPhone : "",
      contactPhoneHref: typeof parsed.contactPhoneHref === "string" ? parsed.contactPhoneHref : "",
      address: typeof parsed.address === "string" ? parsed.address : "",
      opdHoursNote:
        typeof parsed.opdHoursNote === "string" && parsed.opdHoursNote.trim().length > 0
          ? parsed.opdHoursNote
          : DEFAULTS.opdHoursNote,
    };
  } catch {
    return DEFAULTS;
  }
}

function sanitize(input: Partial<HospitalSettings>): HospitalSettings {
  return {
    hospitalName:
      typeof input.hospitalName === "string" && input.hospitalName.trim().length > 0
        ? input.hospitalName
        : DEFAULTS.hospitalName,
    slotMinutes: [10, 15, 20, 30, 60].includes(input.slotMinutes as number)
      ? (input.slotMinutes as HospitalSettings["slotMinutes"])
      : DEFAULTS.slotMinutes,
    contactPhone: typeof input.contactPhone === "string" ? input.contactPhone : "",
    contactPhoneHref: typeof input.contactPhoneHref === "string" ? input.contactPhoneHref : "",
    address: typeof input.address === "string" ? input.address : "",
    opdHoursNote:
      typeof input.opdHoursNote === "string" && input.opdHoursNote.trim().length > 0
        ? input.opdHoursNote
        : DEFAULTS.opdHoursNote,
  };
}

// Hospital profile, shared by every device. Reads prefer the server copy
// (public endpoint — safe on logged-out pages, never triggers auth redirects)
// and fall back to this device's copy when offline. Saves always persist
// locally and sync to the server when the signer is an administrator.
export function useHospitalSettings(): {
  settings: HospitalSettings;
  source: "server" | "device";
  saveSettings: (next: HospitalSettings) => void;
} {
  const [settings, setSettings] = useState<HospitalSettings>(DEFAULTS);
  const [source, setSource] = useState<"server" | "device">("device");

  useEffect(() => {
    let cancelled = false;
    setSettings(load());
    void (async () => {
      try {
        const { data } = await apiClient.get<{ data: Partial<HospitalSettings> }>(
          "/public/settings",
        );
        if (!cancelled && data?.data) {
          const next = sanitize(data.data);
          setSettings(next);
          setSource("server");
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // storage unavailable (private mode) — keep in-memory value
          }
        }
      } catch {
        // offline or server down — device copy stays
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveSettings = useCallback((next: HospitalSettings): void => {
    const clean = sanitize(next);
    setSettings(clean);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // storage unavailable (private mode) — keep in-memory value
    }
    // Admins propagate to every device; others keep the device copy (the
    // server answers 403, which we quietly ignore).
    void apiClient
      .put("/settings", clean)
      .then(() => setSource("server"))
      .catch(() => {});
  }, []);

  return { settings, source, saveSettings };
}

// OPD working hours 09:00–17:00 with a lunch break 13:00–14:00.
export function buildSlots(slotMinutes: number): string[] {
  const slots: string[] = [];
  const fmt = (h: number, m: number): string => {
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
  };
  for (let mins = 9 * 60; mins < 17 * 60; mins += slotMinutes) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 13) continue; // lunch hour
    slots.push(fmt(h, m));
  }
  return slots;
}
