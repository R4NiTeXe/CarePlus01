import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers.js";

describe("hospital settings", () => {
  it("serves the public profile without auth", async () => {
    const res = await request(createApp()).get("/api/v1/public/settings");
    expect(res.status).toBe(200);
    expect(res.body.data.hospitalName).toBeTruthy();
    expect(res.body.data.slotMinutes).toBeGreaterThan(0);
  });

  it("lets an admin update and read back settings", async () => {
    const token = await loginAs("Admin");
    const put = await request(createApp())
      .put("/api/v1/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ hospitalName: "Test General Hospital", slotMinutes: 15 });
    expect(put.status).toBe(200);
    expect(put.body.data.hospitalName).toBe("Test General Hospital");
    expect(put.body.data.slotMinutes).toBe(15);

    const get = await request(createApp())
      .get("/api/v1/settings")
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.data.hospitalName).toBe("Test General Hospital");
  });

  it("blocks non-admin writes and bad slot values", async () => {
    const nurse = await loginAs("Nurse");
    const forbidden = await request(createApp())
      .put("/api/v1/settings")
      .set("Authorization", `Bearer ${nurse}`)
      .send({ hospitalName: "Nope" });
    expect(forbidden.status).toBe(403);

    const admin = await loginAs("Admin");
    const bad = await request(createApp())
      .put("/api/v1/settings")
      .set("Authorization", `Bearer ${admin}`)
      .send({ slotMinutes: 45 });
    expect(bad.status).toBe(400);
  });
});
