import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(new URL(name, import.meta.url), "utf8");

const page = read("../../pages/HomePage.tsx");
const css = read("./NexHomeCatalog.css");

describe("Nex fotografli sektor vitrini", () => {
  it("sektorler kategorilerden once gelir", () => {
    expect(page.indexOf('className="nex-home-sector"'))
      .toBeLessThan(page.indexOf('className="nex-home-popular"'));
  });

  it("alti fotografli sektor korunur", () => {
    const sector = page
      .split('className="nex-home-sector"')[1]
      .split("</section>")[0];

    expect(sector).toContain("src={item.image}");
    expect(sector).toContain("catalog.sectors[5]");
  });

  it("populer kategoriler esit ve kucuktur", () => {
    expect(page).toContain(
      "sectors.slice(0, 6).map((sector)"
    );
    expect(css).toContain("height: 130px !important");
    expect(css).not.toContain("grid-column: span 2");
  });

  it("sektor kategori eslestirmeleri korunur", () => {
    expect(page).toContain("homeCategories.find(");
    expect(page).toContain("item.categoryName");
  });

  it("beyaz ve lacivert marka tasarimi korunur", () => {
    expect(css).toContain("background: #FFFFFF");
    expect(css).toContain("color: #15283F");
  });
});
