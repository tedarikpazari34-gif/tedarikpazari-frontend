import { describe, expect, it } from "vitest";
import { getHeroCopy, heroCopy } from "./NexHomeHero.copy";

describe("Nex yeni anasayfa yedi dil kontrolu", () => {
  it.each(["tr", "en", "ka", "ru", "de", "ar", "uz"])(
    "%s dilinin butun metinleri mevcut",
    (language) => {
      const content = getHeroCopy(language);
      for (const value of Object.values(content)) {
        expect(typeof value).toBe("string");
        expect(value.trim().length).toBeGreaterThan(3);
      }
    }
  );

  it("Turkce slogan korunur", () => {
    expect(heroCopy.tr.title)
      .toBe("Yeni Pazarlara, Güçlü Bağlantılarla.");
  });

  it("bilinmeyen dil Turkceye doner", () => {
    expect(getHeroCopy("xx")).toBe(heroCopy.tr);
  });

  it("bolgesel dil kodu desteklenir", () => {
    expect(getHeroCopy("en-US")).toBe(heroCopy.en);
  });
  it("Turkce marka ust basligi korunur", () => {
    expect(heroCopy.tr.eyebrow)
      .toBe("TÜRKİYE’NİN TOPTAN TİCARET PLATFORMU");
  });

  it("yedi dilde marka ust basligi bulunur", () => {
    for (const content of Object.values(heroCopy)) {
      expect(content.eyebrow.trim().length)
        .toBeGreaterThan(10);
    }
  });

});
