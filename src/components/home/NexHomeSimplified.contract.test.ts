import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(new URL(name, import.meta.url), "utf8");

const page = read("../../pages/HomePage.tsx");
const css = read("./NexHomeCatalog.css");

describe("Nex sade anasayfa", () => {
  it("gercek urunler korunur", () => {
    expect(page).toContain("featuredProducts.map((product)");
    expect(page).toContain("{product.price}");
  });

  it("populer kategori fotograflari korunur", () => {
    expect(page).toContain("sectors.slice(0, 6).map((sector)");
    expect(page).toContain("src={sector.image}");
  });

  it("sektor fotograflari gosterilir", () => {
    const section = page.split('className="nex-home-sector"')[1]
      .split("</section>")[0];
    expect(section).toContain("src={item.image}");
    expect(section).toContain("catalog.sectors[5]");
  });

  it("sektor baglantilari korunur", () => {
    expect(page).toContain("homeCategories.find(");
    expect(page).toContain('className="nex-home-sector-tile"');
  });

  it("dort hizli baglanti korunur", () => {
    expect(page).toContain('className="nex-home-quick-card"');
    expect(page).toContain('to: "/favorites"');
  });

  it("yedi dildeki katalog metinleri kullanilir", () => {
    expect(page).toContain("catalog.heading[1]");
    expect(page).toContain("catalog.quick[1][2]");
  });

  it("temiz katalog css kullanilir", () => {
    expect(css).toContain(".nex-home-sector-tile > img");
    expect(css).toContain(".nex-home-shortcuts-links");
    expect(css).toContain("background: #FFFFFF");
  });
});
