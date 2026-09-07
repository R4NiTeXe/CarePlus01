import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers.js";

describe("patient chart updates", () => {
  it("lets clinical roles correct chart details", async () => {
    const token = await loginAs("Doctor");
    const res = await request(createApp())
      .patch("/api/v1/patients/CP-1001")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "9876501234", allergies: ["Penicillin"] });
    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe("9876501234");
    expect(res.body.data.allergies).toContain("Penicillin");
  });

  it("rejects empty patches, unknown patients, and wrong roles", async () => {
    const doctor = await loginAs("Doctor");
    const empty = await request(createApp())
      .patch("/api/v1/patients/CP-1001")
      .set("Authorization", `Bearer ${doctor}`)
      .send({});
    expect(empty.status).toBe(400);

    const missing = await request(createApp())
      .patch("/api/v1/patients/CP-9999")
      .set("Authorization", `Bearer ${doctor}`)
      .send({ phone: "9876501234" });
    expect(missing.status).toBe(404);

    const cashier = await loginAs("Cashier");
    const forbidden = await request(createApp())
      .patch("/api/v1/patients/CP-1001")
      .set("Authorization", `Bearer ${cashier}`)
      .send({ phone: "9876501234" });
    expect(forbidden.status).toBe(403);
  });
});
