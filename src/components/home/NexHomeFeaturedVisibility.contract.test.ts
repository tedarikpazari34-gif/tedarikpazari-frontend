import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  new URL("../../pages/HomePage.tsx", import.meta.url), "utf8"
);

describe("Nex urun vitrini gorunurlugu", () => {
  it("ana sayfa vitrini kapali", () => {
    expect(page).toContain("SHOW_HOME_FEATURED_PRODUCTS = false");
    expect(page).toContain(
      "SHOW_HOME_FEATURED_PRODUCTS && featuredProducts.length > 0"
    );
  });

  it("urun ve sektor kodlari korunur", () => {
    expect(page).toContain("featuredProducts.map((product)");
    expect(page).toContain("mapApiProductToCard");
    expect(page).toContain('className="nex-home-sector"');
  });
});
