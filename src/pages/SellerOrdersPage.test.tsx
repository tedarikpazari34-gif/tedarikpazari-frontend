// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import i18n from "../i18n";
import { shippingFormTranslations } from "../i18n/shippingFormTranslations";
import SellerOrdersPage from "./SellerOrdersPage";

vi.mock("../components/InvoiceUploadForm", () => ({
  default: () => null,
}));
vi.mock("../components/InvoiceList", () => ({
  default: () => null,
}));
vi.mock("../components/SellerDisputesPanel", () => ({
  default: () => null,
}));
vi.mock("../lib/invoiceApi", () => ({
  invoiceApi: new Proxy({}, {
    get: () => vi.fn(async () => []),
  }),
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
  totalAmount: 100,
  buyer: { id: "buyer-1" },
};

function mockOrders(orders: unknown[]) {
  vi.stubGlobal("fetch", vi.fn(async (input: unknown) => {
    if (!String(input).endsWith("/orders")) {
      throw new Error("Unexpected test URL: " + String(input));
    }
    return { ok: true, json: async () => orders };
  }));
}

beforeEach(() => {
  localStorage.setItem("token", "TEST_ONLY_TOKEN");
  vi.stubGlobal("alert", vi.fn());
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  await i18n.changeLanguage("tr");
  localStorage.clear();
});

describe.each(["tr", "en", "ka", "ru", "de", "ar", "uz"] as const)(
  "SellerOrdersPage gerçek çeviri: %s",
  (language) => {
    it("kayıtlı ambar ve irsaliye bilgilerini gösterir", async () => {
      await i18n.changeLanguage(language);
      mockOrders([freight]);
      render(<SellerOrdersPage />);

      const section = await screen.findByRole("region", {
        name: String(i18n.t("adminOrdersPage.shippingInfo")),
      });
      expect(within(section).getByText("TEST FREIGHT")).toBeTruthy();
      expect(within(section).getByText("AMB-456")).toBeTruthy();
      expect(within(section).getByText("IRS-789")).toBeTruthy();
      expect(within(section).getByText(
        String(i18n.t("adminOrdersPage.freight")),
      )).toBeTruthy();
    });

    it("gönderim formunda gerçek dil kaynaklarını kullanır", async () => {
      await i18n.changeLanguage(language);
      mockOrders([{ ...freight, status: "PREPARING" }]);
      render(<SellerOrdersPage />);

      fireEvent.click(await screen.findByRole("button", {
        name: String(i18n.t("sellerOrdersPage.shipOrder")),
      }));
      const dialog = screen.getByRole("dialog");
      const text = shippingFormTranslations[language];

      expect(within(dialog).getByText(text.description)).toBeTruthy();
      expect(within(dialog).getByText(text.cargoDescription)).toBeTruthy();
      expect(within(dialog).getByText(text.freightDescription)).toBeTruthy();
      expect(within(dialog).getByText(text.optionalDispatch)).toBeTruthy();
      expect(within(dialog).getByText(text.dateNotice)).toBeTruthy();
      expect(within(dialog).getByRole("button", {
        name: text.confirm,
      })).toHaveProperty("disabled", true);

      for (const [key, expected] of Object.entries(text)) {
        expect(i18n.t("shippingForm." + key, {
          lng: language,
          fallbackLng: false,
        })).toBe(expected);
      }
      expect(document.documentElement.dir).toBe(
        language === "ar" ? "rtl" : "ltr",
      );
    });
  },
);

describe("SellerOrdersPage gönderim geçmişi", () => {
  it("tamamlanan kargo gönderimini göstermeye devam eder", async () => {
    await i18n.changeLanguage("tr");
    mockOrders([{
      ...freight,
      status: "COMPLETED",
      shippingMethod: "CARGO",
      shippingCompany: "TEST CARGO",
      shippingDispatchNo: null,
    }]);
    render(<SellerOrdersPage />);
    const section = await screen.findByRole("region", {
      name: String(i18n.t("adminOrdersPage.shippingInfo")),
    });
    expect(within(section).getByText("TEST CARGO")).toBeTruthy();
    expect(within(section).queryByText("IRS-789")).toBeNull();
  });

  it("hazırlanan siparişte gönderilmiş bilgisi göstermez", async () => {
    await i18n.changeLanguage("tr");
    mockOrders([{ ...freight, status: "PREPARING" }]);
    render(<SellerOrdersPage />);
    await screen.findByText("TEST PRODUCT");
    expect(screen.queryByRole("region", {
      name: String(i18n.t("adminOrdersPage.shippingInfo")),
    })).toBeNull();
  });
});

describe("SellerOrdersPage gönderim formu işlemleri", () => {
  for (const method of ["CARGO", "FREIGHT"] as const) {
    it(method + " formunu gönderir ve güncel gönderimi gösterir", async () => {
      await i18n.changeLanguage("tr");
      let saved = false;
      const fetchMock = vi.fn(async (input: unknown, options?: RequestInit) => {
        const url = String(input);
        if (url.endsWith("/orders") && !options?.method) {
          return {
            ok: true,
            json: async () => [{
              ...freight,
              status: saved ? "SHIPPED" : "PREPARING",
              shippingMethod: method,
              shippingCompany: "FORM CARRIER",
              shippingTrackingNo: "FORM-123",
              shippingDispatchNo: "FORM-IRS",
            }],
          };
        }
        if (url.endsWith("/orders/freight-order-1/ship") &&
            options?.method === "POST") {
          saved = true;
          return { ok: true, json: async () => ({ message: "OK" }) };
        }
        throw new Error("Unexpected test request: " + url);
      });
      vi.stubGlobal("fetch", fetchMock);
      render(<SellerOrdersPage />);

      fireEvent.click(await screen.findByRole("button", {
        name: String(i18n.t("sellerOrdersPage.shipOrder")),
      }));
      if (method === "FREIGHT") {
        fireEvent.click(screen.getByRole("button", {
          name: new RegExp(String(i18n.t("adminOrdersPage.freight"))),
        }));
      }

      const text = shippingFormTranslations.tr;
      fireEvent.change(screen.getByPlaceholderText(
        method === "FREIGHT" ? text.freightExample : text.cargoExample,
      ), { target: { value: "  FORM CARRIER  " } });
      fireEvent.change(screen.getByPlaceholderText(
        method === "FREIGHT" ? text.freightReferenceExample : text.trackingExample,
      ), { target: { value: "  FORM-123  " } });
      fireEvent.change(screen.getByPlaceholderText(text.dispatchExample), {
        target: { value: "  FORM-IRS  " },
      });
      fireEvent.click(screen.getByRole("button", { name: text.confirm }));

      const section = await screen.findByRole("region", {
        name: String(i18n.t("adminOrdersPage.shippingInfo")),
      });
      expect(within(section).getByText("FORM-123")).toBeTruthy();
      expect(within(section).getByText("FORM-IRS")).toBeTruthy();
      expect(screen.queryByRole("dialog")).toBeNull();

      const posts = fetchMock.mock.calls.filter(([, options]) =>
        options?.method === "POST",
      );
      expect(posts).toHaveLength(1);
      expect(JSON.parse(String(posts[0][1]?.body))).toEqual({
        shippingMethod: method,
        shippingCompany: "FORM CARRIER",
        shippingTrackingNo: "FORM-123",
        shippingDispatchNo: "FORM-IRS",
      });
      expect(posts[0][1]?.headers).toMatchObject({
        Authorization: "Bearer TEST_ONLY_TOKEN",
      });
    });
  }

  it("API hatasında formu ve girilen bilgileri korur", async () => {
    await i18n.changeLanguage("tr");
    const fetchMock = vi.fn(async (input: unknown, options?: RequestInit) => {
      if (options?.method === "POST") {
        return {
          ok: false,
          status: 409,
          json: async () => ({ message: "TEST SHIP REJECTED" }),
        };
      }
      if (String(input).endsWith("/orders")) {
        return {
          ok: true,
          json: async () => [{ ...freight, status: "PREPARING" }],
        };
      }
      throw new Error("Unexpected test request");
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<SellerOrdersPage />);

    fireEvent.click(await screen.findByRole("button", {
      name: String(i18n.t("sellerOrdersPage.shipOrder")),
    }));
    const text = shippingFormTranslations.tr;
    fireEvent.change(screen.getByPlaceholderText(text.cargoExample), {
      target: { value: "KEEP CARRIER" },
    });
    fireEvent.change(screen.getByPlaceholderText(text.trackingExample), {
      target: { value: "KEEP-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: text.confirm }));

    await vi.waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("TEST SHIP REJECTED");
      expect(screen.getByRole("button", {
        name: text.confirm,
      })).toHaveProperty("disabled", false);
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByPlaceholderText(text.cargoExample))
      .toHaveProperty("value", "KEEP CARRIER");
    expect(screen.getByPlaceholderText(text.trackingExample))
      .toHaveProperty("value", "KEEP-123");
    expect(fetchMock.mock.calls.filter(([, options]) =>
      options?.method === "POST",
    )).toHaveLength(1);
  });
});
