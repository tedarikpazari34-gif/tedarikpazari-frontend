// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import AdminOrdersPage from "./AdminOrdersPage";

vi.mock("react-i18next", () => {
  const translate = (key: string) => key.split(".").pop() || key;
  return {
    useTranslation: () => ({
      t: translate,
      i18n: { language: "tr" },
    }),
  };

});

vi.mock("../components/admin/AdminSidebar", () => ({
  default: () => <nav>Admin Sidebar</nav>,
}));

const cargoOrder = {
  id: "cargo-order-1",
  status: "SHIPPED",
  createdAt: "2026-11-01T10:00:00Z",
  shippedAt: "2026-11-02T10:00:00Z",
  totalAmount: 900,
  productTitleSnapshot: "Kargo Test Ürünü",
  shippingMethod: "CARGO",
  shippingCompany: "Örnek Kargo",
  shippingTrackingNo: "KRG-123",
  shippingDispatchNo: null,
};

const freightOrder = {
  id: "freight-order-2",
  status: "SHIPPED",
  createdAt: "2026-11-03T10:00:00Z",
  shippedAt: "2026-11-04T10:00:00Z",
  totalAmount: 2500,
  productTitleSnapshot: "Ambar Test Ürünü",
  shippingMethod: "FREIGHT",
  shippingCompany: "Örnek Ambar",
  shippingTrackingNo: "AMB-456",
  shippingDispatchNo: "IRS-789",
};

function mockOrders(orders: unknown[]) {
  vi.stubGlobal("fetch", vi.fn(async (input: string) => {
    const url = String(input);

    if (url.endsWith("/orders")) {
      return {
        ok: true,
        json: async () => orders,
      };
    }

    const marker = "/orders/";
    const index = url.lastIndexOf(marker);

    if (index < 0) {
      throw new Error(`Unexpected test URL: ${url}`);
    }

    const orderId = decodeURIComponent(
      url.slice(index + marker.length)
    );

    const order = orders.find(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        "id" in item &&
        item.id === orderId
    );

    return {
      ok: !!order,
      status: order ? 200 : 404,
      json: async () => order,
    };
  }));
}

describe("AdminOrdersPage gönderim ekranı", () => {
  beforeEach(() => {
    localStorage.setItem("token", "TEST_ONLY_TOKEN");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("boş sipariş listesinde uygun mesaj gösterir", async () => {
    mockOrders([]);

    render(<AdminOrdersPage />);

    expect(await screen.findByText("empty")).toBeTruthy();
  });

  it("kargo gönderiminin detaylarını gösterir", async () => {
    mockOrders([cargoOrder]);

    render(<AdminOrdersPage />);

    fireEvent.click(await screen.findByRole("button", { name: "details" }));

    await waitFor(() => {
      expect(screen.getByText("Örnek Kargo")).toBeTruthy();
      expect(screen.getByText("KRG-123")).toBeTruthy();
      expect(screen.getByText("cargo")).toBeTruthy();
    });
  });

  it("ambar gönderiminin fiş ve irsaliye bilgilerini gösterir", async () => {
    mockOrders([freightOrder]);

    render(<AdminOrdersPage />);

    fireEvent.click(await screen.findByRole("button", { name: "details" }));

    await waitFor(() => {
      expect(screen.getByText("Örnek Ambar")).toBeTruthy();
      expect(screen.getByText("AMB-456")).toBeTruthy();
      expect(screen.getByText("IRS-789")).toBeTruthy();
      expect(screen.getByText("freight")).toBeTruthy();
    });
  });

  it("arama sonucunda yalnızca eşleşen sipariş görünür", async () => {
    mockOrders([cargoOrder, freightOrder]);
    render(<AdminOrdersPage />);

    await screen.findByText("Kargo Test Ürünü");

    fireEvent.change(screen.getByRole("textbox", { name: "search" }), {
      target: { value: "AMB-456" },
    });

    expect(screen.getByText("Ambar Test Ürünü")).toBeTruthy();
    expect(screen.queryByText("Kargo Test Ürünü")).toBeNull();
  });

  it("durum filtresi siparişleri sınırlar", async () => {
    mockOrders([
      cargoOrder,
      { ...freightOrder, status: "PREPARING" },
    ]);
    render(<AdminOrdersPage />);

    await screen.findByText("Kargo Test Ürünü");

    fireEvent.change(screen.getByRole("combobox", { name: "allStatuses" }), {
      target: { value: "PREPARING" },
    });

    expect(screen.getByText("Ambar Test Ürünü")).toBeTruthy();
    expect(screen.queryByText("Kargo Test Ürünü")).toBeNull();
  });

  it("açılan sipariş detayları tekrar kapatılabilir", async () => {
    mockOrders([cargoOrder]);
    render(<AdminOrdersPage />);

    fireEvent.click(await screen.findByRole("button", { name: "details" }));
    await screen.findByText("KRG-123");

    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(screen.queryByText("KRG-123")).toBeNull();
  });

  it("API hatası kullanıcıya gösterilir", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    render(<AdminOrdersPage />);

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "loadFailed",
    );
  });

  it("oturum anahtarı yoksa API çağrılmaz", async () => {
    localStorage.removeItem("token");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOrdersPage />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });


  it("detay açıldığında yetkili detay API çağrılır", async () => {
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.endsWith("/orders/cargo-order-1")
          ? { ...cargoOrder, shippingTrackingNo: "DETAY-999" }
          : [cargoOrder],
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOrdersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "details" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) =>
        String(url).endsWith("/orders/cargo-order-1")
      )).toBe(true);
      expect(screen.getByText("DETAY-999")).toBeTruthy();
    });
  });

  it("detay API erişimi reddederse liste bilgilerini detay olarak göstermez", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) =>
      String(url).endsWith("/orders/cargo-order-1")
        ? { ok: false, status: 403 }
        : { ok: true, json: async () => [cargoOrder] }
    ));

    render(<AdminOrdersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "details" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("KRG-123")).toBeNull();
  });

  it("başka sipariş açıldığında önceki detay gösterilmez", async () => {
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => {
        if (String(url).endsWith("/orders/cargo-order-1"))
          return cargoOrder;
        if (String(url).endsWith("/orders/freight-order-2"))
          return freightOrder;
        return [cargoOrder, freightOrder];
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOrdersPage />);
    const buttons = await screen.findAllByRole("button", { name: "details" });
    fireEvent.click(buttons[0]);
    await screen.findByText("KRG-123");

    fireEvent.click(screen.getAllByRole("button", { name: "details" })[0]);

    await waitFor(() => {
      expect(screen.getByText("AMB-456")).toBeTruthy();
      expect(screen.queryByText("KRG-123")).toBeNull();
    });
  });


  it("geciken eski sipariş yanıtı yeni sipariş detayını değiştirmez", async () => {
    let resolveCargo: ((value: unknown) => void) | undefined;

    const pendingCargo = new Promise<unknown>((resolve) => {
      resolveCargo = resolve;
    });

    const fetchMock = vi.fn(async (input: string) => {
      const url = String(input);

      if (url.endsWith("/orders")) {
        return {
          ok: true,
          json: async () => [cargoOrder, freightOrder],
        };
      }

      if (url.endsWith("/orders/cargo-order-1")) {
        return pendingCargo;
      }

      if (url.endsWith("/orders/freight-order-2")) {
        return {
          ok: true,
          json: async () => freightOrder,
        };
      }

      throw new Error(`Unexpected test URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOrdersPage />);
    await screen.findByText("Kargo Test Ürünü");

    fireEvent.click(
      screen.getAllByRole("button", { name: "details" })[0]
    );

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) =>
        String(url).endsWith("/orders/cargo-order-1")
      )).toBe(true);
    });

    fireEvent.click(
      screen.getByRole("button", { name: "details" })
    );

    await screen.findByText("AMB-456");
    expect(screen.queryByText("KRG-123")).toBeNull();

    await act(async () => {
      resolveCargo?.({
        ok: true,
        json: async () => ({
          ...cargoOrder,
          shippingTrackingNo: "LATE-CARGO",
        }),
      });
    });

    expect(screen.getByText("AMB-456")).toBeTruthy();
    expect(screen.queryByText("LATE-CARGO")).toBeNull();
  });

  it("detay API farklı sipariş kimliği döndürürse reddeder", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string) => {
      const url = String(input);

      if (url.endsWith("/orders/cargo-order-1")) {
        return {
          ok: true,
          json: async () => ({
            ...cargoOrder,
            id: "wrong-order",
          }),
        };
      }

      return {
        ok: true,
        json: async () => [cargoOrder],
      };
    }));

    render(<AdminOrdersPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "details" })
    );

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("KRG-123")).toBeNull();
  });


});
