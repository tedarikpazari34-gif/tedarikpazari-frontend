import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  new URL("../../pages/HomePage.tsx", import.meta.url),
  "utf8"
);

describe("Nex urun odakli anasayfa", () => {
  it("urunler kategorilerden once gelir", () => {
    expect(page.indexOf("featuredProducts.map((product)"))
      .toBeLessThan(page.indexOf("sectors.slice(0, 6).map((sector)"));
  });

  it("kategori ve sektor alanlari korunur", () => {
    expect(page).toContain('className="nex-home-popular"');
    expect(page).toContain('className="nex-home-sector"');
  });

  it("alisveris kisayollari korunur", () => {
    expect(page).toContain('className="nex-home-shortcuts"');
    expect(page).toContain('className="nex-home-quick-card"');
  });

  it("gercek urun verileri korunur", () => {
    expect(page).toContain("{product.price}");
    expect(page).toContain("product.moq");
    expect(page).toContain("`/product/${product.id}`");
  });

  it("tekrar eden bilgi kutulari kaldirildi", () => {
    expect(page).not.toContain("catalog.benefits[0]");
    expect(page).not.toContain("catalog.trustBar[0]");
  });

  it("uye kayit baglantilari korunur", () => {
    expect(page).toContain('to="/register?role=BUYER"');
    expect(page).toContain('to="/register?role=SELLER"');
  });
});
