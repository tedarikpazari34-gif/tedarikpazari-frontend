export function getIyzicoPaymentStatusPath(
  createdOrderId: unknown,
  response: {
    orderId?: unknown;
    paymentAttemptId?: unknown;
  } | null | undefined
): string | null {
  const validId = /^[A-Za-z0-9_-]{1,128}$/;
  const orderId = String(createdOrderId ?? "");
  const returnedOrderId = String(response?.orderId ?? "");
  const attemptId = String(response?.paymentAttemptId ?? "");

  if (
    !validId.test(orderId) ||
    returnedOrderId !== orderId ||
    !validId.test(attemptId)
  ) {
    return null;
  }

  const params = new URLSearchParams({
    payment: "check",
    orderId,
    paymentAttemptId: attemptId,
  });

  return `/buyer/orders?${params.toString()}`;
}
