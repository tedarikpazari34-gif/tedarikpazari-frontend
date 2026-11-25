import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  catalogTranslations,
  getNexCatalogCopy
} from "./NexHomeCatalog.copy";

const homepage = readFileSync(
  new URL("../../pages/HomePage.tsx", import.meta.url), "utf8"
);

describe("Nex ana sayfa son bolum cevirileri", () => {
  it.each(["tr", "en", "ka", "ru", "de", "ar", "uz"])(
    "%s dili eksiksiz",
    (language) => {
      const copy = getNexCatalogCopy(language);
      expect(copy.benefits).toHaveLength(4);
      expect(copy.trustBar).toHaveLength(3);
      expect(copy.productHeading).toHaveLength(2);
      expect(copy.register).toHaveLength(2);
      const texts = [
        ...copy.benefits.flat(),
        ...copy.trustBar,
        ...copy.productHeading,
        ...copy.register
      ];
      expect(texts.every(value => value.trim().length > 0))
        .toBe(true);
    }
  );

  it("Turkce metinler dogru", () => {
    expect(catalogTranslations.tr.productHeading[1])
      .toBe("Yeni Eklenen Ürünler");
    expect(catalogTranslations.tr.register[0])
      .toBe("Alıcı Olarak Üye Ol");
  });

  it("yinelenen avantaj kutulari kaldirildi", () => {
    expect(homepage).not.toContain("...catalog.benefits[0]");
    expect(homepage).not.toContain("...catalog.benefits[3]");
    expect(homepage).not.toContain("catalog.trustBar[2]");
  });

  it("urun basliklari ve kayit dugmeleri ceviriye bagli", () => {
    expect(homepage).toContain("{catalog.productHeading[1]}");
    expect(homepage).toContain("{catalog.register[0]}");
    expect(homepage).toContain("{catalog.register[1]}");
  });

  it("nakliye teklif hizmeti tanitimi yapilmaz", () => {
    expect(catalogTranslations.tr.benefits[3][1])
      .toContain("Satıcı veya alıcının organize ettiği");
  });

  it("kategori ve urun baglantilari korunur", () => {
    expect(homepage).toContain("homeCategories.find(");
    expect(homepage).toContain("{product.price}");
    expect(homepage).toContain('to="/register?role=BUYER"');
    expect(homepage).toContain('to="/register?role=SELLER"');
  });
});
