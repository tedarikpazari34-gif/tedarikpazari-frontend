// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "../i18n";
import BuyerOrdersPage from "./BuyerOrdersPage";

vi.mock("../components/buyer/BuyerDisputesPanel", () => ({
  default: () => null,
}));
vi.mock("../components/buyer/BuyerDisputeAction", () => ({
  default: () => null,
}));
vi.mock("../components/InvoiceList", () => ({
  default: () => null,
}));
vi.mock("../components/BuyerPaymentIssueInfo", () => ({
  default: () => null,
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));
vi.mock("@capacitor/browser", () => ({
  Browser: {
    open: vi.fn(),
    addListener: vi.fn(),
  },
}));

const freight = {
  id: "freight-order-1",
  status: "SHIPPED",
  productTitleSnapshot: "TEST PRODUCT",
  shippingMethod: "FREIGHT",
  shippingCompany: "TEST FREIGHT",
  shippingTrackingNo: "AMB-456",
  shippingDispatchNo: "IRS-789",
  shippedAt: "2026-11-04T10:00:00Z",
  quantity: 2,
  totalAmount: 100,
};

function mockOrders(orders: unknown[]) {
  const fetchMock = vi.fn(async (input: unknown, options?: RequestInit) => {
    if (!String(input).endsWith("/orders") || options?.method === "POST") {
      throw new Error("Unexpected test request: " + String(input));
    }
    return { ok: true, json: async () => orders };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/buyer/orders"]}>
      <BuyerOrdersPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.setItem("token", "TEST_ONLY_TOKEN");
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  await i18n.changeLanguage("tr");
  localStorage.clear();
});

describe.each(["tr", "en", "ka", "ru", "de", "ar", "uz"] as const)(
  "BuyerOrdersPage gerçek çeviri: %s",
  (language) => {
    it("ambar gönderimini ve irsaliyeyi gösterir", async () => {
      await i18n.changeLanguage(language);
      const fetchMock = mockOrders([freight]);
      renderPage();

      await screen.findByText("TEST PRODUCT");
      const card = screen.getByText("TEST PRODUCT").closest("article");
      expect(card).not.toBeNull();
      expect(card!.textContent).toContain(
        String(i18n.t("adminOrdersPage.freight")),
      );
      expect(card!.textContent).toContain("TEST FREIGHT");
      expect(card!.textContent).toContain("AMB-456");
      expect(card!.textContent).toContain(
        String(i18n.t("adminOrdersPage.dispatchNo")),
      );
      expect(card!.textContent).toContain("IRS-789");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(document.documentElement.dir).toBe(
        language === "ar" ? "rtl" : "ltr",
      );
    });

    it("kargo gönderimini irsaliye olmadan gösterir", async () => {
      await i18n.changeLanguage(language);
      mockOrders([{
        ...freight,
        shippingMethod: "CARGO",
        shippingCompany: "TEST CARGO",
        shippingTrackingNo: "KRG-123",
        shippingDispatchNo: null,
      }]);
      renderPage();

      await screen.findByText("TEST PRODUCT");
      const card = screen.getByText("TEST PRODUCT").closest("article");
      expect(card).not.toBeNull();
      expect(card!.textContent).toContain(
        String(i18n.t("adminOrdersPage.cargo")),
      );
      expect(card!.textContent).toContain("TEST CARGO");
      expect(card!.textContent).toContain("KRG-123");
      expect(card!.textContent).not.toContain("IRS-789");
      expect(card!.textContent).not.toContain(
        String(i18n.t("adminOrdersPage.dispatchNo")),
      );
    });
  },
);

describe("BuyerOrdersPage gönderim geçmişi", () => {
  it("tamamlanan siparişin gönderim bilgilerini korur", async () => {
    await i18n.changeLanguage("tr");
    mockOrders([{ ...freight, status: "COMPLETED" }]);
    renderPage();

    await screen.findByText("TEST PRODUCT");
    expect(document.body.textContent).toContain("AMB-456");
    expect(document.body.textContent).toContain("IRS-789");
  });

  it("iptal edilen siparişi listelemez", async () => {
    await i18n.changeLanguage("tr");
    mockOrders([
      { ...freight, id: "cancelled-1", status: "CANCELLED",
        productTitleSnapshot: "CANCELLED PRODUCT" },
      { ...freight, id: "preparing-1", status: "PREPARING" },
    ]);
    renderPage();

    await screen.findByText("TEST PRODUCT");
    expect(screen.queryByText("CANCELLED PRODUCT")).toBeNull();
    expect(document.body.textContent).not.toContain("AMB-456");
    expect(document.body.textContent).not.toContain("IRS-789");
  });
});


function renderIyzicoResult(
  serverStatus: string,
  options: {
    responseOrderId?: string;
    responseAttemptId?: string;
    httpOk?: boolean;
    query?: string;
  } = {}
) {
  const orderId = "order-payment-1";
  const attemptId = "attempt-payment-1";

  const fetchMock = vi.fn(async (input: unknown) => {
    const url = String(input);

    if (url.endsWith("/orders")) {
      return {
        ok: true,
        json: async () => [{
          id: orderId,
          status: "PAID",
          productTitleSnapshot: "PAYMENT TEST PRODUCT",
          quantity: 1,
          totalAmount: 100,
        }],
      };
    }

    if (url.endsWith(
      `/payments/iyzico/attempts/${attemptId}/status`
    )) {
      return {
        ok: options.httpOk !== false,
        json: async () => ({
          orderId: options.responseOrderId ?? orderId,
          paymentAttemptId:
            options.responseAttemptId ?? attemptId,
          status: serverStatus,
        }),
      };
    }

    throw new Error("Unexpected test request: " + url);
  });

  vi.stubGlobal("fetch", fetchMock);

  const query = options.query ??
    `payment=success&orderId=${orderId}&paymentAttemptId=${attemptId}`;

  render(
    <MemoryRouter initialEntries={[
      `/buyer/orders?${query}`
    ]}>
      <BuyerOrdersPage />
    </MemoryRouter>
  );

  return fetchMock;
}

describe("BuyerOrdersPage iyzico ödeme sonucu güvenliği", () => {
  it("yalnız doğrulanmış işlem için başarı gösterir", async () => {
    renderIyzicoResult("SUCCESS");

    await screen.findByText(String(
      i18n.t("buyerOrdersPage.paymentSuccessMessage")
    ));
  });

  it("sahte success URL'sini kabul etmez", async () => {
    renderIyzicoResult("SUCCESS", {
      query: "payment=success&orderId=order-payment-1",
    });

    await screen.findByText(String(
      i18n.t("buyerOrdersPage.paymentUnknownMessage")
    ));

    expect(screen.queryByText(String(
      i18n.t("buyerOrdersPage.paymentSuccessMessage")
    ))).toBeNull();
  });

  it("başka siparişe ait başarıyı reddeder", async () => {
    renderIyzicoResult("SUCCESS", {
      responseOrderId: "different-order",
    });

    await screen.findByText(String(
      i18n.t("buyerOrdersPage.paymentUnknownMessage")
    ));

    expect(screen.queryByText(String(
      i18n.t("buyerOrdersPage.paymentSuccessMessage")
    ))).toBeNull();
  });

  it("başka ödeme denemesinin sonucunu reddeder", async () => {
    renderIyzicoResult("SUCCESS", {
      responseAttemptId: "different-attempt",
    });

    await screen.findByText(String(
      i18n.t("buyerOrdersPage.paymentUnknownMessage")
    ));
  });

  it("yetkisiz API yanıtını başarı kabul etmez", async () => {
    renderIyzicoResult("SUCCESS", { httpOk: false });

    await screen.findByText(String(
      i18n.t("buyerOrdersPage.paymentUnknownMessage")
    ));
  });

  it("başarısız ödemeyi doğru gösterir", async () => {
    renderIyzicoResult("FAILED");

    await screen.findByText(String(
      i18n.t("buyerOrdersPage.paymentFailedMessage")
    ));
  });

  it("bekleyen ödemeyi başarısız göstermez", async () => {
    renderIyzicoResult("PENDING");

    await screen.findByText(String(
      i18n.t("buyerOrdersPage.paymentPendingMessage")
    ));
  });

  it.each(["tr", "en", "ka", "ru", "de", "ar", "uz"] as const)(
    "REVIEW durumunu %s dilinde doğru gösterir",
    async (language) => {
      await i18n.changeLanguage(language);
      renderIyzicoResult("REVIEW");

      await screen.findByText(String(
        i18n.t("buyerOrdersPage.paymentReviewMessage")
      ));

      expect(screen.queryByText(String(
        i18n.t("buyerOrdersPage.paymentSuccessMessage")
      ))).toBeNull();
    }
  );
});
