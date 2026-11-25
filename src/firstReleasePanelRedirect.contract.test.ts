import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync("src/App.tsx", "utf8");

describe("First release legacy panel redirect", () => {
  it("does not mount the legacy quote-loading panel", () => {
    expect(app).not.toContain("<PanelPage />");
    expect(app).not.toContain(
      'import PanelPage from "./pages/PanelPage"'
    );
    expect(app).toMatch(
      /path="\/panel"[\s\S]*?<FirstReleasePanelRedirect \/>/
    );
  });

  it("redirects all four user roles", () => {
    for (const [role, destination] of [
      ["BUYER", "/buyer/dashboard"],
      ["SELLER", "/seller/dashboard"],
      ["ADMIN", "/admin"],
      ["LOGISTICS", "/logistics/dashboard"],
    ]) {
      expect(app).toContain(
        `${role}: "${destination}"`
      );
    }
  });

  it("preserves historical shipping pages", () => {
    expect(app).toContain("<BuyerShippingQuotesPage />");
    expect(app).toContain("<LogisticsOrdersPage />");
    expect(app).toContain(
      '<Navigate to="/logistics/orders" replace />'
    );
  });

  it("preserves ordinary buyer and seller orders", () => {
    expect(app).toContain('path="/buyer/orders"');
    expect(app).toContain('path="/seller/orders"');
  });
});
