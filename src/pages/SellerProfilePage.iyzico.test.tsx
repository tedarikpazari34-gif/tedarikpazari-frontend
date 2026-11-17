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
import { MemoryRouter } from "react-router-dom";
import i18n from "../i18n";
import SellerProfilePage from "./SellerProfilePage";

type ProfileFlags = {
  iyzicoOnboardingCompleted?: boolean;
  iyzicoOnboardingPending?: boolean;
};

function mockApi(
  flags: ProfileFlags = {},
  postOk = true
) {
  const fetchMock = vi.fn(
    async (input: unknown, options?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/company/me") && !options?.method) {
        return {
          ok: true,
          json: async () => ({
            id: "TEST_SELLER_COMPANY",
            name: "Test Seller Company",
            role: "SELLER",
            status: "APPROVED",
            verified: true,
            country: "Türkiye",
            ...flags,
          }),
        };
      }

      if (
        url.endsWith("/payments/iyzico/submerchant") &&
        options?.method === "POST"
      ) {
        return {
          ok: postOk,
          json: async () =>
            postOk
              ? { success: true }
              : { message: "Ödeme sağlayıcısı işlemi reddetti." },
        };
      }

      throw new Error(
        "Beklenmeyen test API isteği: " + url
      );
    }
  );

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function postCalls(
  fetchMock: ReturnType<typeof mockApi>
) {
  return fetchMock.mock.calls.filter(
    ([, options]) => options?.method === "POST"
  );
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SellerProfilePage />
    </MemoryRouter>
  );
}

async function waitForIbanForm() {
  return screen.findByPlaceholderText(
    "TR00 0000 0000 0000 0000 0000 00"
  );
}

function activationButton() {
  return screen.getByRole("button", {
    name: i18n.t("sellerProfilePage.iyzicoActivate"),
  });
}

beforeEach(async () => {
  localStorage.setItem("token", "TEST_ONLY_TOKEN");
  localStorage.setItem("role", "SELLER");
  await i18n.changeLanguage("tr");
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  await i18n.changeLanguage("tr");
});

describe("Satıcı iyzico gerçek arayüz davranışları", () => {
  it("yanlış MOD-97 IBAN ile POST göndermez", async () => {
    const fetchMock = mockApi();
    renderPage();

    const input = await waitForIbanForm();

    fireEvent.change(input, {
      target: {
        value: "TR330006100519786457841327",
      },
    });

    fireEvent.click(activationButton());

    expect(
      await screen.findByText(
        i18n.t("sellerProfilePage.iyzicoInvalidIban")
      )
    ).toBeTruthy();

    expect(postCalls(fetchMock)).toHaveLength(0);
  });

  it("bekleyen başvuruda yeniden başvuru butonu göstermez", async () => {
    const fetchMock = mockApi({
      iyzicoOnboardingPending: true,
    });

    renderPage();

    await screen.findByText(
      i18n.t("sellerProfilePage.iyzicoPendingMessage")
    );

    expect(
      screen.queryByRole("button", {
        name: i18n.t("sellerProfilePage.iyzicoActivate"),
      })
    ).toBeNull();

    expect(postCalls(fetchMock)).toHaveLength(0);
  });

  it("tamamlanmış hesapta yeni başvuru butonu göstermez", async () => {
    const fetchMock = mockApi({
      iyzicoOnboardingCompleted: true,
    });

    renderPage();

    await screen.findByText(
      i18n.t("sellerProfilePage.iyzicoActiveMessage")
    );

    expect(
      screen.queryByRole("button", {
        name: i18n.t("sellerProfilePage.iyzicoActivate"),
      })
    ).toBeNull();

    expect(postCalls(fetchMock)).toHaveLength(0);
  });

  it("alıcı rolüne iyzico satıcı başvuru butonu göstermez", async () => {
    localStorage.setItem("role", "BUYER");

    const fetchMock = mockApi();
    renderPage();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(
      screen.queryByRole("button", {
        name: i18n.t("sellerProfilePage.iyzicoActivate"),
      })
    ).toBeNull();

    expect(postCalls(fetchMock)).toHaveLength(0);
  });

  it("geçerli IBAN'ı normalize ederek yetkili POST gönderir", async () => {
    const fetchMock = mockApi();
    renderPage();

    const input = await waitForIbanForm();

    fireEvent.change(input, {
      target: {
        value: "TR33 0006 1005 1978 6457 8413 26",
      },
    });

    fireEvent.click(activationButton());

    await waitFor(() => {
      expect(postCalls(fetchMock)).toHaveLength(1);
    });

    const [, options] = postCalls(fetchMock)[0];

    expect(options?.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer TEST_ONLY_TOKEN",
      })
    );

    expect(JSON.parse(String(options?.body))).toEqual({
      iban: "TR330006100519786457841326",
    });
  });

  it("İngilizce ekranda sağlayıcının Türkçe hatasını göstermez", async () => {
    await i18n.changeLanguage("en");

    const fetchMock = mockApi({}, false);
    renderPage();

    const input = await waitForIbanForm();

    fireEvent.change(input, {
      target: {
        value: "TR330006100519786457841326",
      },
    });

    fireEvent.click(activationButton());

    expect(
      await screen.findByText(
        i18n.t("sellerProfilePage.iyzicoStartFailed")
      )
    ).toBeTruthy();

    expect(
      screen.queryByText(
        "Ödeme sağlayıcısı işlemi reddetti."
      )
    ).toBeNull();

    expect(postCalls(fetchMock)).toHaveLength(1);
  });
});
