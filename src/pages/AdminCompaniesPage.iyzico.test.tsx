// @vitest-environment jsdom
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import i18n from "../i18n";
import AdminCompaniesPage from "./AdminCompaniesPage";

type Company = {
  id: string;
  name: string;
  role: string;
  status: string;
  verified: boolean;
  iyzicoOnboardingPending?: boolean;
  iyzicoOnboardingCompleted?: boolean;
};

function seller(overrides: Partial<Company> = {}): Company {
  return {
    id: "seller-1",
    name: "Test Seller One",
    role: "SELLER",
    status: "APPROVED",
    verified: true,
    iyzicoOnboardingPending: true,
    iyzicoOnboardingCompleted: false,
    ...overrides,
  };
}

type Outcome = "success" | "failure" | "connection-error";

function mockApi(
  companies: Company[],
  outcome: Outcome = "success"
) {
  const fetchMock = vi.fn(
    async (input: unknown, options?: RequestInit) => {
      const url = String(input);

      if (
        url.endsWith("/admin/companies") &&
        options?.method !== "POST"
      ) {
        return {
          ok: true,
          json: async () => companies,
        };
      }

      if (
        url.includes(
          "/payments/iyzico/submerchant/reconcile/"
        ) &&
        options?.method === "POST"
      ) {
        if (outcome === "connection-error") {
          throw new Error("TEST_ONLY_CONNECTION_ERROR");
        }

        return {
          ok: outcome === "success",
          json: async () =>
            outcome === "success"
              ? { message: "Mutabakat tamamlandı." }
              : { message: "Sağlayıcı işlemi reddetti." },
        };
      }

      throw new Error("Beklenmeyen test isteği: " + url);
    }
  );

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function reconcileCalls(
  fetchMock: ReturnType<typeof mockApi>
) {
  return fetchMock.mock.calls.filter(
    ([input, options]) =>
      String(input).includes(
        "/payments/iyzico/submerchant/reconcile/"
      ) &&
      options?.method === "POST"
  );
}

function renderPage() {
  return render(<AdminCompaniesPage />);
}

async function openCompany(index = 0) {
  const details = await screen.findAllByRole("button", {
    name: i18n.t("adminCompaniesPage.detail"),
  });

  fireEvent.click(details[index]);
}

function reconcileButton() {
  return screen.getByRole("button", {
    name: i18n.t("adminCompaniesPage.iyzicoReconcileAction"),
  });
}

beforeEach(async () => {
  localStorage.setItem("token", "TEST_ONLY_ADMIN_TOKEN");
  await i18n.changeLanguage("tr");

  vi.stubGlobal("confirm", vi.fn(() => true));
  vi.stubGlobal("alert", vi.fn());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
  await i18n.changeLanguage("tr");
});

describe("Admin iyzico gerçek arayüz güvenlik testleri", () => {
  it("yönetici işlemi iptal ederse POST göndermez", async () => {
    const fetchMock = mockApi([seller()]);
    vi.stubGlobal("confirm", vi.fn(() => false));

    renderPage();
    await openCompany();
    fireEvent.click(reconcileButton());

    expect(window.confirm).toHaveBeenCalledWith(
      i18n.t("adminCompaniesPage.iyzicoReconcileConfirm")
    );
    expect(reconcileCalls(fetchMock)).toHaveLength(0);
  });

  it.each([
    ["başlatılmamış", {
      iyzicoOnboardingPending: false,
      iyzicoOnboardingCompleted: false,
    }],
    ["tamamlanmış", {
      iyzicoOnboardingPending: false,
      iyzicoOnboardingCompleted: true,
    }],
  ])("%s hesap için mutabakat butonu göstermez", async (
    _label,
    flags
  ) => {
    const fetchMock = mockApi([seller(flags)]);

    renderPage();
    await openCompany();

    expect(
      screen.queryByRole("button", {
        name: i18n.t(
          "adminCompaniesPage.iyzicoReconcileAction"
        ),
      })
    ).toBeNull();

    expect(reconcileCalls(fetchMock)).toHaveLength(0);
  });

  it("alıcı şirketinde mutabakat butonu göstermez", async () => {
    const fetchMock = mockApi([
      seller({
        role: "BUYER",
        iyzicoOnboardingPending: true,
      }),
    ]);

    renderPage();
    await openCompany();

    expect(
      screen.queryByRole("button", {
        name: i18n.t(
          "adminCompaniesPage.iyzicoReconcileAction"
        ),
      })
    ).toBeNull();

    expect(reconcileCalls(fetchMock)).toHaveLength(0);
  });

  it("bekleyen satıcı için yetkili POST gönderir", async () => {
    const fetchMock = mockApi([seller()]);

    renderPage();
    await openCompany();
    fireEvent.click(reconcileButton());

    await waitFor(() => {
      expect(reconcileCalls(fetchMock)).toHaveLength(1);
    });

    const [url, options] = reconcileCalls(fetchMock)[0];

    expect(String(url)).toContain(
      "/payments/iyzico/submerchant/reconcile/seller-1"
    );
    expect(options?.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer TEST_ONLY_ADMIN_TOKEN",
      })
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Mutabakat tamamlandı."
      );
    });

    expect(
      screen.getByText(
        i18n.t("adminCompaniesPage.iyzicoActiveStatus")
      )
    ).toBeTruthy();
  });

  it("seçilen ikinci şirketin kimliğini kullanır", async () => {
    const fetchMock = mockApi([
      seller({
        id: "seller-1",
        name: "First Seller",
      }),
      seller({
        id: "seller-2",
        name: "Second Seller",
      }),
    ]);

    renderPage();
    await openCompany(1);
    fireEvent.click(reconcileButton());

    await waitFor(() => {
      expect(reconcileCalls(fetchMock)).toHaveLength(1);
    });

    const [url] = reconcileCalls(fetchMock)[0];

    expect(String(url)).toContain(
      "/reconcile/seller-2"
    );
    expect(String(url)).not.toContain(
      "/reconcile/seller-1"
    );
  });

  it("başarısız mutabakatı aktif hesap olarak göstermez", async () => {
    await i18n.changeLanguage("en");

    const fetchMock = mockApi(
      [seller()],
      "failure"
    );

    renderPage();
    await openCompany();
    fireEvent.click(reconcileButton());

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        i18n.t("adminCompaniesPage.iyzicoReconcileFailed")
      );
    });

    expect(
      screen.getByText(
        i18n.t("adminCompaniesPage.iyzicoPendingStatus")
      )
    ).toBeTruthy();

    expect(reconcileCalls(fetchMock)).toHaveLength(1);
  });

  it("bağlantı hatasında yerel dilde uyarı gösterir", async () => {
    await i18n.changeLanguage("en");

    const fetchMock = mockApi(
      [seller()],
      "connection-error"
    );

    renderPage();
    await openCompany();
    fireEvent.click(reconcileButton());

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        i18n.t(
          "adminCompaniesPage.iyzicoReconcileConnectionError"
        )
      );
    });

    expect(reconcileCalls(fetchMock)).toHaveLength(1);
  });

  it("giriş belirteci yoksa mutabakat POST göndermez", async () => {
    const fetchMock = mockApi([seller()]);

    renderPage();
    await openCompany();

    localStorage.removeItem("token");
    fireEvent.click(reconcileButton());

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        i18n.t("adminCompaniesPage.adminLoginRequired")
      );
    });

    expect(reconcileCalls(fetchMock)).toHaveLength(0);
  });
});
