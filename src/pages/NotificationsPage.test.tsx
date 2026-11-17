// @vitest-environment jsdom
import {
  afterEach, beforeEach, describe, expect, it, vi
} from "vitest";
import {
  cleanup, fireEvent, render, screen, waitFor
} from "@testing-library/react";
import {
  MemoryRouter, Route, Routes, useLocation
} from "react-router-dom";
import i18n from "../i18n";
import NotificationsPage from "./NotificationsPage";

type Notice = {
  id: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

function notice(link = "/seller/profile"): Notice {
  return {
    id: "TEST_ONLY_NOTICE_1",
    title: "TEST_ONLY_NOTICE",
    message: "TEST_ONLY_MESSAGE",
    link,
    isRead: false,
    createdAt: "2026-11-17T12:00:00Z",
  };
}

function CurrentLocation() {
  const location = useLocation();
  return (
    <output data-testid="current-route">
      {location.pathname}
    </output>
  );
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/notifications"]}>
      <CurrentLocation />
      <Routes>
        <Route
          path="/notifications"
          element={<NotificationsPage />}
        />
        <Route path="*" element={<div>TEST_DESTINATION</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function mockApi(
  items: Notice[],
  markStatus = 200,
  allStatus = 200
) {
  const fetchMock = vi.fn(async (
    input: unknown,
    options?: RequestInit
  ) => {
    const url = String(input);

    if (url.endsWith("/notifications/mine")) {
      return {
        ok: true,
        status: 200,
        json: async () => items,
      };
    }

    if (
      url.endsWith("/notifications/read-all") &&
      options?.method === "PATCH"
    ) {
      return {
        ok: allStatus === 200,
        status: allStatus,
      };
    }

    if (
      url.endsWith("/notifications/TEST_ONLY_NOTICE_1/read") &&
      options?.method === "PATCH"
    ) {
      return {
        ok: markStatus === 200,
        status: markStatus,
      };
    }

    throw new Error("Beklenmeyen test API istegi: " + url);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(async () => {
  localStorage.setItem("token", "TEST_ONLY_JWT");
  localStorage.setItem("role", "SELLER");
  await i18n.changeLanguage("tr");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
  await i18n.changeLanguage("tr");
});

describe("Bildirim merkezi arayuz davranisi", () => {
  it.each([
    ["BUYER", "/buyer/orders"],
    ["SELLER", "/seller/profile"],
    ["ADMIN", "/admin/companies"],
  ])("%s bildirimini dogru rotaya yonlendirir",
    async (role, route) => {
      localStorage.setItem("role", role);
      const fetchMock = mockApi([notice(route)]);

      renderPage();

      const detail = await screen.findByRole("button", {
        name: i18n.t("notificationsPage.goToDetail"),
      });
      fireEvent.click(detail);

      await waitFor(() => {
        expect(
          screen.getByTestId("current-route").textContent
        ).toBe(route);
      });

      expect(
        fetchMock.mock.calls.some(
          ([url]) => String(url).includes("/notifications/mine")
        )
      ).toBe(true);
    }
  );

  it("tekli okundu basariliysa butonu kaldirir", async () => {
    mockApi([notice()]);
    renderPage();

    const button = await screen.findByRole("button", {
      name: i18n.t("notificationsPage.markRead"),
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: i18n.t("notificationsPage.markRead"),
        })
      ).toBeNull();
    });
  });

  it("tekli okundu HTTP 503 olursa okunmadi kalir", async () => {
    mockApi([notice()], 503);
    renderPage();

    const button = await screen.findByRole("button", {
      name: i18n.t("notificationsPage.markRead"),
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(
      screen.getByRole("button", {
        name: i18n.t("notificationsPage.markRead"),
      })
    ).toBeTruthy();
  });

  it("toplu okundu basariliysa butonu kaldirir", async () => {
    mockApi([notice()]);
    renderPage();

    const button = await screen.findByRole("button", {
      name: i18n.t("notificationsPage.markAllRead"),
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: i18n.t("notificationsPage.markAllRead"),
        })
      ).toBeNull();
    });
  });

  it("toplu okundu HTTP 503 olursa okunmadi kalir", async () => {
    mockApi([notice()], 200, 503);
    renderPage();

    const button = await screen.findByRole("button", {
      name: i18n.t("notificationsPage.markAllRead"),
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(
      screen.getByRole("button", {
        name: i18n.t("notificationsPage.markAllRead"),
      })
    ).toBeTruthy();
  });

  it("guvensiz dis adreslere yonlendirmez", async () => {
    mockApi([notice("https://evil.example")]);
    renderPage();

    const button = await screen.findByRole("button", {
      name: i18n.t("notificationsPage.goToDetail"),
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByTestId("current-route").textContent
      ).toBe("/notifications");
    });
  });

  it("bildirimleri yalnizca yetkili API'den ister", async () => {
    const fetchMock = mockApi([notice()]);
    renderPage();

    await screen.findByText("TEST_ONLY_NOTICE");

    const request = fetchMock.mock.calls.find(
      ([url]) => String(url).endsWith("/notifications/mine")
    );

    expect(request).toBeDefined();
    expect(request?.[1]?.headers).toEqual({
      Authorization: "Bearer TEST_ONLY_JWT",
    });
  });
});
