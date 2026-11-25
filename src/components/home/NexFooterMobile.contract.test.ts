import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footer = readFileSync(
  new URL("../Footer.tsx", import.meta.url), "utf8"
);

const css = readFileSync(
  new URL("../../index.css", import.meta.url), "utf8"
);

describe("Nex mobil footer duzeni", () => {
  it("destek bolumu mobilde tam genislik kullanir", () => {
    expect(footer).toContain(
      'gridColumn: isMobile ? "1 / -1" : undefined'
    );
  });

  it("e-posta adresi satir ortasinda bolunmez", () => {
    expect(footer).toContain('whiteSpace: "nowrap"');
    expect(footer).toContain('overflowWrap: "normal"');
    expect(footer).toContain('wordBreak: "normal"');
  });

  it("sabit mobil menu icin alt bosluk korunur", () => {
    expect(footer).toContain(
      'padding: isMobile ? "28px 18px 120px"'
    );
    expect(css).toContain(
      'padding-bottom: calc(74px + env(safe-area-inset-bottom))'
    );
  });
});
