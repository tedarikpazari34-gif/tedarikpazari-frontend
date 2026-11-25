import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getPopularCategoryCopy } from "./NexHomePopularCategories.copy";

describe("Populer kategoriler yedi dil", () => {
  it.each(["tr", "en", "ka", "ru", "de", "ar", "uz"])(
    "%s kategori cevirileri eksiksiz",
    (language) => {
      const copy = getPopularCategoryCopy(language);
      expect(Object.keys(copy.names)).toHaveLength(8);
      expect(copy.eyebrow.trim().length).toBeGreaterThan(0);
      expect(Object.values(copy.names).every(
        (name) => name.trim().length > 0
      )).toBe(true);
    }
  );

  it("bilinmeyen dil Turkceye doner", () => {
    expect(getPopularCategoryCopy("xx").eyebrow)
      .toBe("ALIŞVERİŞE BAŞLA");
  });

  it("mevcut kategori kart yapisi ve baglantilari korunur", () => {
    const page = readFileSync(
      new URL("../../pages/HomePage.tsx", import.meta.url),
      "utf8"
    );

    expect(page).toContain("sectors.slice(0, 6).map((sector)");
    expect(page).toContain("resolveHomeCategoryHref(sector.title)");
    expect(page).toContain(
      "popularCopy.names[sector.title] || sector.title"
    );
  });
});
