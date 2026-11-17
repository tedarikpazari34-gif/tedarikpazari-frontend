import { describe, expect, it } from "vitest";
import { isValidTurkishIban } from "./turkishIban";

describe("Türkiye IBAN güvenlik doğrulaması", () => {
  const valid = "TR330006100519786457841326";

  it("geçerli IBAN kabul edilir", () => {
    expect(isValidTurkishIban(valid)).toBe(true);
  });

  it("boşluklu IBAN kabul edilir", () => {
    expect(
      isValidTurkishIban("TR33 0006 1005 1978 6457 8413 26")
    ).toBe(true);
  });

  it("küçük harfli TR kabul edilir", () => {
    expect(isValidTurkishIban(valid.toLowerCase())).toBe(true);
  });

  it("yanlış MOD-97 kontrol basamakları reddedilir", () => {
    expect(
      isValidTurkishIban("TR330006100519786457841327")
    ).toBe(false);
  });

  it("eksik IBAN reddedilir", () => {
    expect(isValidTurkishIban("TR123")).toBe(false);
  });

  it("harf içeren hatalı hesap numarası reddedilir", () => {
    expect(
      isValidTurkishIban("TR33000610051978645784132A")
    ).toBe(false);
  });

  it("fazla uzun IBAN reddedilir", () => {
    expect(isValidTurkishIban(valid + "0")).toBe(false);
  });

  it("boş IBAN reddedilir", () => {
    expect(isValidTurkishIban("")).toBe(false);
  });
});
