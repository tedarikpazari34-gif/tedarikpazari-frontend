import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const list = readFileSync(
  new URL("./ProductsPage.tsx", import.meta.url), "utf8"
);
const detail = readFileSync(
  new URL("./ProductDetailPage.tsx", import.meta.url), "utf8"
);

describe("Alici urun sayfalari marka paleti", () => {
  it("iki sayfa da saf beyaz zemin kullanir", () => {
    expect(list).toContain('background: "#FFFFFF"');
    expect(detail).toContain('background: "#FFFFFF"');
  });

  it("urun listesi lacivert ve bakir kullanir", () => {
    expect(list).toContain('background: "#15283F"');
    expect(list).toContain('background: "#C76B43"');
    expect(list).not.toContain(
      "linear-gradient(135deg, #16B83E"
    );
  });

  it("urun detayinda yeni marka renkleri vardir", () => {
    expect(detail).toContain('color: "#15283F"');
    expect(detail).toContain('background: "#C76B43"');
    expect(detail).not.toContain(
      "linear-gradient(135deg, #16B83E"
    );
  });

  it("onay ve sepete ekleme durumlari korunur", () => {
    expect(detail).toContain(
      'product.isApproved ? "#dcfce7"'
    );
    expect(detail).toContain(
      'product.isApproved ? "#166534"'
    );
    expect(list).toContain('? "#047857"');
  });
});


describe("Kalan eski marka renklerinin temizlenmesi", () => {
  it("urun listesinde eski lacivert ve mavi bulunmaz", () => {
    expect(list).not.toContain("#0B3D6E");
    expect(list).not.toContain("#2563eb");
  });

  it("urun detayinda eski marka renkleri bulunmaz", () => {
    expect(detail).not.toContain("#0B3D6E");
    expect(detail).not.toContain("#2563eb");
    expect(detail).not.toContain("#16A34A");
  });

  it("anlamli yesil durum rengi korunur", () => {
    expect(detail).toContain(
      'color: green ? "#16a34a" : "#0f172a"'
    );
  });

  it("hemen al butonunun kenarligi yeni laciverttir", () => {
    expect(detail).toContain(
      'border: "1.5px solid #15283F"'
    );
  });
});
