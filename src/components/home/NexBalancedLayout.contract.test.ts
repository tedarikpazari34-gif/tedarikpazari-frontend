import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(new URL(name, import.meta.url), "utf8");

const page = read("../../pages/HomePage.tsx");
const css = read("./NexHomeCatalog.css");
const footer = read("../Footer.tsx");
const footerCss = read("../NexFooterPalette.css");

describe("Nex dengeli anasayfa", () => {
  it("populer kategoriler 6 esit karttir", () => {
    expect(page).toContain("sectors.slice(0, 6).map((sector)");
    expect(css).toContain("repeat(3, minmax(0,1fr))");
    expect(css).not.toContain("grid-column: span 2");
  });

  it("kategori baglantilari korunur", () => {
    expect(page).toContain('to="/categories"');
    expect(page).toContain("homeCategories.find(");
  });

  it("sektor bolumu acik zemindir", () => {
    expect(css).toContain(".nex-home-sector");
    expect(css).toContain("background: #FFFFFF");
  });

  it("uyelik bandi beyazdir", () => {
    expect(page).toContain("nex-home-cta");
    expect(css).toContain("background-image: none !important");
  });

  it("footer tek laciverttir", () => {
    expect(footer).toContain("nex-brand-footer");
    expect(footerCss).toContain("#15283F");
  });

  it("urun ve kayit baglantilari korunur", () => {
    expect(page).toContain("featuredProducts.map((product)");
    expect(page).toContain('to="/register?role=BUYER"');
    expect(page).toContain('to="/register?role=SELLER"');
  });
});
