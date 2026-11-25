import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homepage = readFileSync(
  new URL("../../pages/HomePage.tsx", import.meta.url), "utf8"
);

describe("Nex anasayfa katalog tasarim sozlesmesi", () => {
  it("uc kart turu yeni tasarima baglidir", () => {
    expect(homepage).toContain('className="nex-home-quick-card"');
    expect(homepage).toContain('className="nex-home-sector-tile"');
    expect(homepage).toContain('className="nex-home-product-tile"');
  });

  it("gercek urun fiyati ve kimligi korunur", () => {
    expect(homepage).toContain("{product.price}");
    expect(homepage).toContain("`/product/${product.id}`");
    expect(homepage).toContain("{product.image}");
  });

  it("minimum siparis miktari gorunur", () => {
    expect(homepage).toContain("catalog.product[1]");
    expect(homepage).toContain("product.unitType");
  });

  it("kategori kimligi API verilerinden bulunur", () => {
    expect(homepage).toContain("homeCategories.find(");
    expect(homepage).toContain("item.categoryName");
  });

  it("kartlarda Turkce metin kullanilir", () => {
    expect(homepage).toContain("catalog.quick[1][2]");
    expect(homepage).toContain("catalog.sectors[3]");
  });
});
