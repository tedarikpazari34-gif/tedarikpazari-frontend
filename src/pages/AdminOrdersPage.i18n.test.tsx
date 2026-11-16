// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import i18n from "../i18n";
import { adminOrdersTranslations } from "../i18n/adminOrdersTranslations";
import AdminOrdersPage from "./AdminOrdersPage";

vi.mock("../components/admin/AdminSidebar", () => ({
  default: () => <nav>TEST SIDEBAR</nav>,
}));

const codes = [
  "PENDING_PAYMENT", "PAID", "PREPARING",
  "SHIPPED", "COMPLETED", "CANCELLED",
] as const;

beforeEach(() => {
  localStorage.setItem("token", "TEST_ONLY_TOKEN");
  vi.stubGlobal("fetch", vi.fn(async (input: unknown) => {
    if (!String(input).endsWith("/orders")) {
      throw new Error("Unexpected test request: " + String(input));
    }
    return {
      ok: true,
      json: async () => codes.map((status, index) => ({
        id: "status-order-" + index,
        status,
        productTitleSnapshot: "STATUS PRODUCT " + index,
      })),
    };
  }));
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  await i18n.changeLanguage("tr");
  localStorage.clear();
});

describe.each(["tr", "en", "ka", "ru", "de", "ar", "uz"] as const)(
  "Admin sipariş durumları: %s",
  (language) => {
    it("altı durumu çevirir ve filtre değerlerini korur", async () => {
      await i18n.changeLanguage(language);
      render(<AdminOrdersPage />);
      await screen.findByText("STATUS PRODUCT 5");

      const translations = adminOrdersTranslations[language];
      const select = screen.getByRole("combobox", {
        name: translations.allStatuses,
      });

      for (const [index, code] of codes.entries()) {
        const label = translations.statusLabels[code];
        expect(label).toBeTruthy();
        expect(i18n.t("adminOrdersPage.statusLabels." + code, {
          lng: language,
          fallbackLng: false,
        })).toBe(label);

        const option = within(select).getByRole("option", { name: label });
        expect(option).toHaveProperty("value", code);

        const card = screen.getByText("STATUS PRODUCT " + index).closest("article");
        expect(card).not.toBeNull();
        expect(within(card!).getByText(label)).toBeTruthy();
      }

      fireEvent.change(select, { target: { value: "SHIPPED" } });
      expect(screen.getByText("STATUS PRODUCT 3")).toBeTruthy();
      expect(screen.queryByText("STATUS PRODUCT 0")).toBeNull();
      expect(screen.queryByText("STATUS PRODUCT 5")).toBeNull();

      fireEvent.change(select, { target: { value: "ALL" } });
      expect(screen.getByText("STATUS PRODUCT 0")).toBeTruthy();
      expect(screen.getByText("STATUS PRODUCT 5")).toBeTruthy();
    });
  },
);
