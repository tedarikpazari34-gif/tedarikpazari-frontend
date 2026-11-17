import { resolveLegacyInvoiceNotificationRoute } from "./legacyInvoiceNotificationRoute";

export function resolveSafeNotificationRoute(link: unknown): string {
  const fallback = "/notifications";

  if (typeof link !== "string") return fallback;

  const value = link.trim();

  if (
    !/^\/(?!\/)/.test(value) ||
    /[\\\u0000-\u001F\u007F]/.test(value) ||
    /%(?:2f|5c|2e|25|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)
  ) {
    return fallback;
  }

  const path = value.split(/[?#]/, 1)[0];

  if (path.split("/").some(
    segment => segment === "." || segment === ".."
  )) {
    return fallback;
  }

  return resolveLegacyInvoiceNotificationRoute(value);
}
