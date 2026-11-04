import { describe, expect, it } from "vitest";
import { notificationEligible, notificationTemplate } from "../lib/notification-rules";

describe("payment WhatsApp notifications", () => {
  it("notifies a consenting live buyer when payment succeeds", () => {
    expect(notificationEligible("live", "paid", true)).toBe(true);
    expect(notificationTemplate("paid")).toBe("obsverse_payment_paid");
  });
  it("notifies a consenting live buyer when payment expires", () => {
    expect(notificationEligible("live", "expired", true)).toBe(true);
    expect(notificationTemplate("expired")).toBe("obsverse_payment_expired");
  });
  it("does not message sandbox buyers or buyers who declined notifications", () => {
    expect(notificationEligible("sandbox", "paid", true)).toBe(false);
    expect(notificationEligible("live", "paid", false)).toBe(false);
    expect(notificationEligible("live", "pending", true)).toBe(false);
  });
});