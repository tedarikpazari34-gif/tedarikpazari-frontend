import { describe, expect, it } from "vitest";
import { getNexCatalogCopy, catalogTranslations } from "./NexHomeCatalog.copy";

describe("Nex katalog yedi dil", () => {
  it.each(["tr","en","ka","ru","de","ar","uz"])(
    "%s dili eksiksiz", (language) => {
      const content = getNexCatalogCopy(language);
      expect(content.quick).toHaveLength(4);
      expect(content.sectors).toHaveLength(6);
      expect(content.heading).toHaveLength(3);
      expect(content.product).toHaveLength(5);
      const values = [
        ...content.quick.flat(),
        ...content.sectors,
        ...content.heading,
        ...content.product
      ];
      expect(values.every(value => value.trim().length > 0)).toBe(true);
    }
  );

  it("Turkce metinler dogru", () => {
    expect(catalogTranslations.tr.quick[0][1]).toBe("Yeni Ürünler");
    expect(catalogTranslations.tr.sectors[4]).toBe("Temizlik ve Hijyen");
  });

  it("bilinmeyen dil Turkceye doner", () => {
    expect(getNexCatalogCopy("xx")).toBe(catalogTranslations.tr);
  });

  it("bolgesel dil kodu calisir", () => {
    expect(getNexCatalogCopy("de-DE")).toBe(catalogTranslations.de);
  });
});
