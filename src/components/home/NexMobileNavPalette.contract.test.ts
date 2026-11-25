import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../MobileBottomNav.tsx", import.meta.url),
  "utf8"
);

describe("Nex mobil alt menu marka paleti", () => {
  it("secili simge ve yazi bakir rengindedir", () => {
    const target =
      'color: active ? "#C76B43" : "#64748b",';

    const count = source.split(target).length - 1;

    expect(count).toBe(2);
  });

  it("secili simgenin zemini acik bakirdir", () => {
    expect(source).toContain(
      'background: active ? "#F9EDE6" : "transparent"'
    );
    expect(source).not.toContain("#2563eb");
    expect(source).not.toContain("#eff6ff");
  });

  it("bes menu baglantisi korunur", () => {
    for (const path of [
      "/", "/products", "/cart", "/favorites", "/panel"
    ]) {
      expect(source).toContain(`to: "${path}"`);
    }

    expect(source).toContain('position: "fixed"');
    expect(source).toContain(
      'gridTemplateColumns: "repeat(5, 1fr)"'
    );
  });
});
