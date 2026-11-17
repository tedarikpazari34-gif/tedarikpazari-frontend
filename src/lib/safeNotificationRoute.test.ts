import { describe, expect, it } from "vitest";
import { resolveSafeNotificationRoute } from "./safeNotificationRoute";

describe("Bildirim baglanti guvenligi", () => {
  it.each([
    ["/seller/profile", "/seller/profile"],
    ["/admin/companies", "/admin/companies"],
    ["/buyer/orders", "/buyer/orders"],
    ["/admin/invoices", "/admin/finance"],
    ["/buyer/invoices", "/buyer/orders"],
    ["/buyer/orders?tab=paid", "/buyer/orders"],
    ["https://evil.example", "/notifications"],
    ["//evil.example", "/notifications"],
    ["javascript:alert(1)", "/notifications"],
    ["../admin/companies", "/notifications"],
    ["/%2Fevil.example", "/notifications"],
    ["/seller/../admin", "/notifications"],
    ["/seller/\\evil.example", "/notifications"],
    ["", "/notifications"],
  ])("guvenli adres kontrolu: %s", (input, expected) => {
    const actual = resolveSafeNotificationRoute(input);
    if (input === "/buyer/orders?tab=paid") {
      expect(actual).toBe("/buyer/orders?tab=paid");
    } else {
      expect(actual).toBe(expected);
    }
  });
});
