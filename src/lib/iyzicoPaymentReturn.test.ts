import { describe, expect, it } from "vitest";
import { getIyzicoPaymentStatusPath } from "./iyzicoPaymentReturn";

describe("Sepet iyzico ödeme dönüş güvenliği", () => {
  const response = {
    orderId: "order-1",
    paymentAttemptId: "attempt-1",
  };

  it("doğru işlem için kontrol adresi oluşturur", () => {
    expect(getIyzicoPaymentStatusPath("order-1", response)).toBe(
      "/buyer/orders?payment=check&orderId=order-1&paymentAttemptId=attempt-1"
    );
  });

  it("başka siparişi reddeder", () => {
    expect(getIyzicoPaymentStatusPath("order-2", response)).toBeNull();
  });

  it("eksik ödeme denemesini reddeder", () => {
    expect(getIyzicoPaymentStatusPath("order-1", {
      orderId: "order-1",
    })).toBeNull();
  });

  it("boş sipariş kimliğini reddeder", () => {
    expect(getIyzicoPaymentStatusPath("", response)).toBeNull();
  });

  it("boş API yanıtını reddeder", () => {
    expect(getIyzicoPaymentStatusPath("order-1", null)).toBeNull();
  });

  it("geçersiz sipariş kimliğini reddeder", () => {
    expect(getIyzicoPaymentStatusPath("order/1", {
      orderId: "order/1",
      paymentAttemptId: "attempt-1",
    })).toBeNull();
  });

  it("geçersiz ödeme denemesi kimliğini reddeder", () => {
    expect(getIyzicoPaymentStatusPath("order-1", {
      orderId: "order-1",
      paymentAttemptId: "../attempt",
    })).toBeNull();
  });

  it("çok uzun kimlikleri reddeder", () => {
    const id = "x".repeat(129);
    expect(getIyzicoPaymentStatusPath(id, {
      orderId: id,
      paymentAttemptId: "attempt-1",
    })).toBeNull();
  });

  it("pencere kapanmasını başarı kabul etmez", () => {
    const path = getIyzicoPaymentStatusPath("order-1", response);
    expect(path).toContain("payment=check");
    expect(path).not.toContain("payment=success");
  });
});
