const legacyInvoiceRoutes: Record<string, string> = {
  "/admin/invoices": "/admin/finance",
  "/buyer/invoices": "/buyer/orders",
  "/seller/invoices": "/seller/orders",
};

export function resolveLegacyInvoiceNotificationRoute(
  link: string,
): string {
  return legacyInvoiceRoutes[link] ?? link;
}
