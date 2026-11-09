export interface InvoiceDisputeEligibility {
  status: string;
  resolution?: string | null;
  resolvedAt?: string | null;
  order?: { status?: string | null } | null;
}

export function invoiceDisputeEligible(
  dispute: InvoiceDisputeEligibility,
): boolean {
  const orderStatus = dispute.order?.status;
  const active =
    (dispute.status === "OPEN" ||
      dispute.status === "SELLER_RESPONDED") &&
    dispute.resolution == null &&
    dispute.resolvedAt == null &&
    ["PAID", "PREPARING", "SHIPPED"].includes(orderStatus ?? "");

  const resolvedAt = dispute.resolvedAt;

  const completedBuyerRefund =
    dispute.status === "RESOLVED_BUYER" &&
    dispute.resolution === "REFUND_TO_BUYER" &&
    dispute.order?.status === "CANCELLED" &&
    typeof resolvedAt === "string" &&
    resolvedAt.trim().length > 0 &&
    Number.isFinite(Date.parse(resolvedAt));

  return active || completedBuyerRefund;
}
